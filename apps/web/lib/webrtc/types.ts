// apps/web/libs/webrtc/types.ts

export type ConnectionState =
  | 'INITIALIZING'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'DISCONNECTED';

export interface StreamConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface RTCConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
  bundlePolicy?: RTCBundlePolicy;
}

export interface WebRTCState {
  connectionState: ConnectionState;
  stream: MediaStream | null;
  error: Error | null;
}

export interface WebRTCContextValue extends WebRTCState {
  connect: () => Promise<void>;
  disconnect: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  sendMessage: (message: any) => void;
}

export class WebRTCError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'WebRTCError';
  }
}
