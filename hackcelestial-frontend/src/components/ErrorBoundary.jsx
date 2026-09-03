import { Component } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Recoup crashed:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-page px-4">
        <div className="max-w-sm w-full bg-surface border border-border rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto mb-4 h-11 w-11 rounded-full bg-brand-dim flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-brand" />
          </div>
          <h1 className="font-display font-semibold text-ink text-lg mb-1.5">Something went wrong</h1>
          <p className="text-sm text-ink-dim mb-5">
            Recoup hit an unexpected error. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-sm bg-ink text-page hover:opacity-90 transition"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Reload Recoup
          </button>
          <details className="mt-5 text-left">
            <summary className="text-xs text-ink-faint cursor-pointer hover:text-ink-dim">Technical details</summary>
            <pre className="mt-2 text-[11px] text-ink-faint whitespace-pre-wrap break-words bg-surface-sunk rounded-sm p-3 max-h-32 overflow-auto">
              {this.state.error?.message || String(this.state.error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
