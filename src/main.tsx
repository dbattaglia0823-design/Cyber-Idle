import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App render failed", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="app-shell error-screen">
        <main className="panel">
          <p className="eyebrow">Startup Error</p>
          <h1>The game hit a render error.</h1>
          <p className="muted">{this.state.error.message}</p>
          <div className="card-list compact">
            <button className="primary-button full" onClick={() => window.location.reload()}>Reload</button>
            <button
              className="secondary-button full danger-text"
              onClick={() => {
                localStorage.removeItem("neon-row-idle-save");
                window.location.reload();
              }}
            >
              Clear Local Save And Reload
            </button>
          </div>
        </main>
      </div>
    );
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
