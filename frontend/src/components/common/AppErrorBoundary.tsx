import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangleIcon, RefreshIcon } from './Icons';

export interface AppErrorBoundaryProps {
  children: ReactNode;
}

export interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080C] text-[#F1F5F9] flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full p-8 rounded-2xl bg-white/[0.03] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.8)] space-y-5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangleIcon className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold font-heading text-white uppercase tracking-wider">
                Application State Recovery
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
                An unexpected view render error occurred. Your athlete telemetry and account state remain secure.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-lg bg-black/50 border border-white/5 text-[11px] font-mono text-slate-400 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="btn-primary flex-1 text-xs py-2.5 uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Return to Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-secondary flex-1 text-xs py-2.5 flex items-center justify-center gap-2"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
