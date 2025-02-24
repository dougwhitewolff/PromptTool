'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebRTCService } from './WebRTCService';
import { ConnectionState } from './types';

interface WebRTCContextState {
  isConnected: boolean;
  error: Error | null;
  audioStream: MediaStream | null;
  connectionStatus: ConnectionState;
}

type SetAudioEnabledFn = {
  (value: boolean): void;
};

interface WebRTCContextValue extends WebRTCContextState {
  connect: () => Promise<void>;
  disconnect: () => void;
  setAudioEnabled: SetAudioEnabledFn;
}

const WebRTCContext = createContext<WebRTCContextValue | null>(null);

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [webRTCService] = useState(() => new WebRTCService());
  const [state, setState] = useState<WebRTCContextState>({
    isConnected: false,
    error: null,
    audioStream: null,
    connectionStatus: 'DISCONNECTED',
  });

  useEffect(() => {
    const handleStateChange = (connectionStatus: ConnectionState) => {
      setState((prev) => ({
        ...prev,
        connectionStatus,
        isConnected: connectionStatus === 'CONNECTED',
      }));
    };

    const handleError = (error: Error) => {
      setState((prev) => ({ ...prev, error }));
    };

    const handleStream = (stream: MediaStream) => {
      setState((prev) => ({ ...prev, audioStream: stream }));
    };

    webRTCService.on('stateChange', handleStateChange);
    webRTCService.on('error', handleError);
    webRTCService.on('stream', handleStream);

    return () => {
      webRTCService.removeListener('stateChange', handleStateChange);
      webRTCService.removeListener('error', handleError);
      webRTCService.removeListener('stream', handleStream);
      webRTCService.disconnect();
    };
  }, [webRTCService]);

  const connect = async () => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      await webRTCService.connect();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Connection failed');
      setState((prev) => ({ ...prev, error }));
      throw error;
    }
  };

  const disconnect = () => {
    webRTCService.disconnect();
    setState({
      isConnected: false,
      error: null,
      audioStream: null,
      connectionStatus: 'DISCONNECTED',
    });
  };

  const setAudioEnabled = (enabled: boolean) => {
    webRTCService.setAudioEnabled(enabled);
  };

  const value: WebRTCContextValue = {
    ...state,
    connect,
    disconnect,
    setAudioEnabled,
  };

  return (
    <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>
  );
};

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
};

export default WebRTCProvider;
