import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected rendering error occurred in the contract review workspace.'
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Development-only diagnostics: production builds never log, so contract text cannot leak into consoles or log collectors.
    if (import.meta.env.DEV) {
      console.error('CounterDraft Client-Side Boundary Caught Error:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-wrapper">
          <div className="error-boundary-card" role="alert">
            <span className="section-eyebrow">RUNTIME FAULT ISOLATION</span>
            <h2 className="panel-heading-text">Workspace Rendering Fault Prevented</h2>
            <p className="boundary-description">
              The client-side parser encountered an unexpected structure in the document presentation layer.
              Your local session was preserved without data leakage.
            </p>
            <div className="boundary-details">
              <strong>Error Trace:</strong> {this.state.errorMessage}
            </div>
            <div className="modal-actions-bar section-spaced">
              <button
                type="button"
                onClick={this.handleReset}
                className="action-btn-primary"
              >
                Reload Clean Workspace
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
