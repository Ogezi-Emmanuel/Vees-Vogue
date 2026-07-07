"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
            <div className="text-center">
              <h2 className="text-2xl font-serif text-champagne mb-4">Oops! Something went wrong</h2>
              <p className="text-gray-400 mb-6">Please refresh the page to continue.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-champagne text-black px-6 py-2 rounded-full hover:bg-champagne/90 transition-all"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
