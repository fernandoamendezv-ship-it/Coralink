import React, { Component, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App-level ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-[#1BA7D9]/20 border border-[#1BA7D9] text-[#1BA7D9] rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Coralink - Arte & Personalización</h1>
          <p className="text-slate-300 max-w-md mb-4 text-sm">
            Se detectó una excepción durante el inicio de la interfaz.
          </p>

          {this.state.error && (
            <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-red-500/30 text-left max-w-xl w-full text-xs font-mono text-red-300 overflow-auto max-h-48">
              <p className="font-bold text-red-400 mb-1">{this.state.error.name}: {this.state.error.message}</p>
              <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">{this.state.error.stack}</pre>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 bg-[#1BA7D9] hover:bg-[#158cb6] text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Reintentar Cargar
            </button>
            <button
              onClick={this.handleResetAndReload}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Limpiar Caché y Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Register Coralink PWA Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed:', error);
      });
  });
}
