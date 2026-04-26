"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Result, Button } from "antd";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center p-6">
          <Result
            status="error"
            title="Something went wrong"
            subTitle={this.state.error?.message || "An unexpected error occurred."}
            extra={[
              <Button
                type="primary"
                key="retry"
                onClick={() => this.setState({ hasError: false })}
              >
                Try Again
              </Button>,
              <Button key="home" onClick={() => (window.location.href = "/")}>
                Back Home
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
