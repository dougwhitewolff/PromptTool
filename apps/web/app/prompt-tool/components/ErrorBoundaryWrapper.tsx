// apps/web/apps/web/components/ErrorBoundaryWrapper.tsx
'use client';

import React from 'react';
import ErrorBoundary from '../../../components/ErrorBoundary';
import { WebRTCProvider } from '@/lib/webrtc/WebRTCContext';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
}

const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
}) => {
  return (
    <ErrorBoundary>
      <WebRTCProvider>{children}</WebRTCProvider>
    </ErrorBoundary>
  );
};

export default ErrorBoundaryWrapper;
