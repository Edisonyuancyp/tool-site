"use client";
import React from "react";

interface State { hasError: boolean; error: Error | null }

export default class ToolErrorBoundary extends React.Component<
  { children: React.ReactNode; toolName?: string },
  State
> {
  constructor(props: { children: React.ReactNode; toolName?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ToolErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center space-y-3">
          <div className="text-3xl">⚠️</div>
          <p className="font-semibold text-red-700">
            {this.props.toolName
              ? `${this.props.toolName} ran into an error`
              : "This tool ran into an error"}
          </p>
          <p className="text-sm text-red-500">
            {this.state.error?.message ?? "Unknown error"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-4 py-2 text-sm font-medium bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
