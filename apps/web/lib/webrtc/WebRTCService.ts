// apps/web/lib/webrtc/WebRTCService.ts

import { EventEmitter } from 'events';
import { ConnectionState, StreamConfig, RTCConfig, WebRTCError } from './types';
import { isClient } from '@/lib/utils/environment';

const DEFAULT_STREAM_CONFIG: StreamConfig = {
  sampleRate: 24000,
  channelCount: 1,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

const DEFAULT_RTC_CONFIG: RTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
  iceCandidatePoolSize: 10,
};

export class WebRTCService extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null;
  private mediaStream: MediaStream | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private connectionState: ConnectionState = 'DISCONNECTED';
  private streamConfig: StreamConfig;
  private rtcConfig: RTCConfig;
  private remoteAudioElement: HTMLAudioElement | null = null;

  constructor(
    streamConfig: Partial<StreamConfig> = {},
    rtcConfig: Partial<RTCConfig> = {}
  ) {
    super();
    this.streamConfig = { ...DEFAULT_STREAM_CONFIG, ...streamConfig };
    this.rtcConfig = { ...DEFAULT_RTC_CONFIG, ...rtcConfig };
  }

  private updateConnectionState(state: ConnectionState) {
    this.connectionState = state;
    this.emit('stateChange', state);
  }

  private async setupMediaStream(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: this.streamConfig,
        video: false,
      });
      this.mediaStream = stream;
      return stream;
    } catch (error) {
      throw new WebRTCError(
        'Failed to access microphone',
        'MEDIA_ACCESS_ERROR'
      );
    }
  }

  private setupDataChannelHandlers(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
      this.emit('dataChannelOpen');
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel closed');
      this.emit('dataChannelClose');
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.emit('dataChannelMessage', message);
      } catch (error) {
        console.error('Error parsing data channel message:', error);
        this.emit('error', error);
      }
    };
  }

  public async connect(): Promise<void> {
    try {
      this.updateConnectionState('INITIALIZING');

      // 1. Set up media stream (microphone)
      const stream = await this.setupMediaStream();

      // 2. Create and configure RTCPeerConnection
      this.peerConnection = new RTCPeerConnection(this.rtcConfig);

      // 3. Add audio track
      stream.getAudioTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, stream);
      });

      // 4. Set up remote audio handling
      if (this.peerConnection) {
        this.peerConnection.ontrack = (event) => {
          if (this.remoteAudioElement) {
            this.remoteAudioElement.srcObject = event.streams[0];
          }
          this.emit('stream', event.streams[0]);
        };
      }

      // 5. Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // 6. Fetch ephemeral token
      const tokenResponse = await fetch('/api/realtime/token');
      if (!tokenResponse.ok) {
        throw new WebRTCError(
          'Failed to fetch ephemeral token',
          'TOKEN_FETCH_ERROR'
        );
      }
      const tokenData = await tokenResponse.json();
      const EPHEMERAL_KEY = tokenData.client_secret.value;

      // 7. Send offer to OpenAI Realtime API
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-mini-realtime-preview';
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        throw new WebRTCError(
          'Failed to receive SDP answer from OpenAI',
          'SDP_ANSWER_ERROR'
        );
      }

      // 8. Handle the answer from OpenAI
      const answer = {
        type: 'answer',
        sdp: await sdpResponse.text(),
      };
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      // 9. Create data channel for events
      this.dataChannel = this.peerConnection.createDataChannel('oai-events');
      this.setupDataChannelHandlers();

      this.updateConnectionState('CONNECTED');
    } catch (error) {
      this.updateConnectionState('DISCONNECTED');
      const webRTCError =
        error instanceof Error ? error : new Error('Connection failed');
      this.emit('error', webRTCError);
      throw webRTCError;
    }
  }

  public disconnect(): void {
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.mediaStream?.getTracks().forEach((track) => track.stop());

    this.dataChannel = null;
    this.peerConnection = null;
    this.mediaStream = null;
    this.updateConnectionState('DISCONNECTED');
  }

  public setAudioEnabled(enabled: boolean): void {
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  public setRemoteAudioElement(audioElement: HTMLAudioElement): void {
    this.remoteAudioElement = audioElement;
  }
}
