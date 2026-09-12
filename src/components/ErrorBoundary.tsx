import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 bg-[var(--paper)]">
          <div className="max-w-md w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] p-8 text-center space-y-5 shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600">
              <AlertTriangle size={24} />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
                {this.props.fallbackTitle || 'Unable to display this view'}
              </h2>
              <p className="text-xs text-[var(--ink)] opacity-70 leading-relaxed">
                An unexpected condition was encountered while rendering this component. You can reload this view or navigate back to the home portal.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="rounded bg-[var(--paper)] border border-[var(--line)] p-2.5 text-[11px] font-mono text-[var(--ink)] opacity-80 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 rounded bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
              >
                <RotateCcw size={13} /> Reload View
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 rounded border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
              >
                <Home size={13} /> Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
