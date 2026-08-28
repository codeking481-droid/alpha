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
        <div className="min-h-[60vh] flex items-center justify-center px-6" style={{background:'#FFFCF8'}}>
          <div className="card text-center max-w-md w-full" style={{background:'#FFFFFF', border:'1px solid #EDEDED', borderRadius:'12px', padding:'32px'}}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto" style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.15)', color:'#DC2626'}}>!</div>
            <h2 className="font-semibold mt-3" style={{color:'#0A0A0A', fontSize:'18px'}}>Something went wrong</h2>
            <p className="text-sm mt-2" style={{color:'#6B7280'}}>{String(this.state.error?.message || 'Unexpected error. Please refresh.')}</p>
            <button className="mt-6" style={{background:'#0A0A0A', color:'#FFFFFF', padding:'10px 24px', borderRadius:'8px', fontWeight:600, fontSize:'13px', border:'none', cursor:'pointer'}} onClick={() => window.location.reload()}>
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
