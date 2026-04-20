import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert" className="p-4 rounded-md bg-red-950 border border-red-800 text-red-200">
          <h2 className="text-lg font-semibold mb-2">Failed to load module</h2>
          <p className="text-sm opacity-80">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
