import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                  fill="#ef4444"
                />
              </svg>
            </div>
            
            <h2 className="error-boundary-title">Something went wrong</h2>
            
            <p className="error-boundary-message">
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            <div className="error-boundary-actions">
              <button 
                onClick={this.handleRetry}
                className="error-boundary-button primary"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="error-boundary-button secondary"
              >
                Refresh Page
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="error-boundary-details">
                <summary className="error-boundary-summary">
                  Error Details (Development)
                </summary>
                <div className="error-boundary-stack">
                  {this.state.error && (
                    <div className="error-info">
                      <h4>Error:</h4>
                      <pre>{this.state.error.toString()}</pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div className="error-info">
                      <h4>Stack Trace:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, fallbackComponent) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary fallback={fallbackComponent}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
};

// Async error boundary for handling async operations
export class AsyncErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AsyncErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <div className="async-error-boundary">
          <div className="async-error-content">
            <h3>Failed to load</h3>
            <p>Something went wrong while loading this content.</p>
            <button onClick={this.handleRetry} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundary for GraphQL errors
export const GraphQLErrorBoundary = ({ children, onError }) => {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.networkError) {
        setError(event.reason);
        if (onError) {
          onError(event.reason);
        }
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);

  if (error) {
    return (
      <div className="graphql-error-boundary">
        <div className="graphql-error-content">
          <h3>Network Error</h3>
          <p>
            Unable to connect to the server. Please check your internet connection and try again.
          </p>
          <button 
            onClick={() => setError(null)}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Custom hook for handling specific types of errors
export const useErrorRecovery = () => {
  const [errors, setErrors] = React.useState([]);

  const addError = React.useCallback((error, type = 'general') => {
    const errorWithType = {
      id: Date.now(),
      error,
      type,
      timestamp: new Date().toISOString()
    };
    setErrors(prev => [...prev, errorWithType]);
  }, []);

  const removeError = React.useCallback((errorId) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
  }, []);

  const clearErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    addError,
    removeError,
    clearErrors
  };
};

export default ErrorBoundary;