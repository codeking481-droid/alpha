import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[Alpha ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="mature-card p-8 text-center max-w-md w-full">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">!</div>
            <h2 className="font-black tracking-tight text-white mt-3">Something went wrong</h2>
            <p className="text-sm text-white/40 mt-2">{String(this.state.error?.message || 'Unexpected error. Please refresh.')}</p>
            <button className="bg-white text-[#0B0215] px-6 py-2.5 rounded-full font-black text-xs tracking-widest uppercase mt-6 hover:bg-white/90" onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
