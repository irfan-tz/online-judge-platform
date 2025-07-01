import { useState, useEffect } from "react";
import "./AuthSetupCheck.css";

const AuthSetupCheck = () => {
  const [checks, setChecks] = useState({
    googleClientId: false,
    googleScript: false,
    googleApi: false,
    devServer: false,
  });
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("");
  const [googleError, setGoogleError] = useState(null);

  useEffect(() => {
    runSetupChecks();
  }, []);

  const runSetupChecks = async () => {
    setLoading(true);
    const newChecks = { ...checks };

    // Check 1: Google Client ID
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    newChecks.googleClientId =
      clientId &&
      clientId !== "your-google-client-id.apps.googleusercontent.com";

    // Check 2: Current URL
    const url = window.location.origin;
    setCurrentUrl(url);
    newChecks.devServer =
      url.includes("localhost") || url.includes("127.0.0.1");

    // Check 3: Google Script Loading
    const checkGoogleScript = () => {
      return new Promise((resolve) => {
        if (window.google && window.google.accounts) {
          resolve(true);
        } else {
          const script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.head.appendChild(script);

          // Timeout after 5 seconds
          setTimeout(() => resolve(false), 5000);
        }
      });
    };

    newChecks.googleScript = await checkGoogleScript();

    // Check 4: Google API Initialization
    if (newChecks.googleScript && newChecks.googleClientId) {
      try {
        await new Promise((resolve, reject) => {
          if (window.google && window.google.accounts) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: () => {},
              auto_select: false,
            });
            newChecks.googleApi = true;
            resolve();
          } else {
            reject(new Error("Google accounts not available"));
          }
        });
      } catch (error) {
        setGoogleError(error.message);
        newChecks.googleApi = false;
      }
    }

    setChecks(newChecks);
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    if (loading) return "⏳";
    return status ? "✅" : "❌";
  };

  const getStatusText = (status) => {
    if (loading) return "Checking...";
    return status ? "Configured" : "Needs Setup";
  };

  const allChecksPass = Object.values(checks).every(Boolean);

  return (
    <div className="auth-setup-check">
      <div className="setup-header">
        <h2>🔧 Google OAuth Setup Status</h2>
        <p>Verify your Google authentication configuration</p>
        {!loading && (
          <div
            className={`overall-status ${allChecksPass ? "success" : "warning"}`}
          >
            {allChecksPass ? (
              <span>✅ All checks passed! Google OAuth should work.</span>
            ) : (
              <span>
                ⚠️ Some checks failed. Please review the configuration.
              </span>
            )}
          </div>
        )}
      </div>

      <div className="checks-container">
        <div className="check-item">
          <div className="check-status">
            <span className="status-icon">
              {getStatusIcon(checks.devServer)}
            </span>
            <span className="status-text">
              {getStatusText(checks.devServer)}
            </span>
          </div>
          <div className="check-details">
            <h3>Development Server</h3>
            <p>
              <strong>Current URL:</strong> {currentUrl}
              <br />
              {checks.devServer ? (
                <>Running on localhost (good for development)</>
              ) : (
                <>Not running on localhost - may cause OAuth issues</>
              )}
            </p>
            {!checks.devServer && (
              <div className="fix-instructions">
                <strong>Note:</strong> Make sure your Google OAuth credentials
                include this domain in authorized origins.
              </div>
            )}
          </div>
        </div>

        <div className="check-item">
          <div className="check-status">
            <span className="status-icon">
              {getStatusIcon(checks.googleScript)}
            </span>
            <span className="status-text">
              {getStatusText(checks.googleScript)}
            </span>
          </div>
          <div className="check-details">
            <h3>Google Identity Services Script</h3>
            <p>
              {checks.googleScript ? (
                <>Google Identity Services script loaded successfully</>
              ) : (
                <>Failed to load Google Identity Services script</>
              )}
            </p>
            {!checks.googleScript && (
              <div className="fix-instructions">
                <strong>How to fix:</strong>
                <ul>
                  <li>Check your internet connection</li>
                  <li>Disable ad blockers temporarily</li>
                  <li>Check browser console for script loading errors</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="check-item">
          <div className="check-status">
            <span className="status-icon">
              {getStatusIcon(checks.googleApi)}
            </span>
            <span className="status-text">
              {getStatusText(checks.googleApi)}
            </span>
          </div>
          <div className="check-details">
            <h3>Google API Initialization</h3>
            <p>
              {checks.googleApi ? (
                <>Google API initialized successfully with your Client ID</>
              ) : (
                <>
                  Failed to initialize Google API
                  {googleError && (
                    <>
                      <div className="google-console-setup">
                        <h3>🔧 Google Cloud Console Setup Instructions</h3>
                        <div className="setup-steps">
                          <div className="step">
                            <strong>Step 1:</strong> Go to{" "}
                            <a
                              href="https://console.cloud.google.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Google Cloud Console
                            </a>
                          </div>
                          <div className="step">
                            <strong>Step 2:</strong> Navigate to "APIs &
                            Services" → "Credentials"
                          </div>
                          <div className="step">
                            <strong>Step 3:</strong> Click "Create Credentials"
                            → "OAuth 2.0 Client ID"
                          </div>
                          <div className="step">
                            <strong>Step 4:</strong> Select "Web application" as
                            application type
                          </div>
                          <div className="step">
                            <strong>Step 5:</strong> Add these{" "}
                            <strong>Authorized JavaScript origins</strong>:
                            <div className="code-block">
                              <code>{currentUrl}</code>
                              <br />
                              <code>http://localhost:5173</code>
                              <br />
                              <code>http://localhost:3000</code>
                            </div>
                          </div>
                          <div className="step">
                            <strong>Step 6:</strong> Add these{" "}
                            <strong>Authorized redirect URIs</strong>:
                            <div className="code-block">
                              <code>{currentUrl}</code>
                              <br />
                              <code>http://localhost:5173</code>
                              <br />
                              <code>http://localhost:3000</code>
                            </div>
                          </div>
                          <div className="step">
                            <strong>Step 7:</strong> Copy the Client ID and add
                            it to your .env file as:
                            <div className="code-block">
                              <code>
                                VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
                              </code>
                            </div>
                          </div>
                        </div>
                      </div>
                      <br />
                      <strong>Error:</strong> {googleError}
                    </>
                  )}
                </>
              )}
            </p>
            {!checks.googleApi && (
              <div className="fix-instructions">
                <strong>Common issues:</strong>
                <ul>
                  <li>
                    <strong>Invalid Client ID:</strong> Check the format (should
                    end with .apps.googleusercontent.com)
                  </li>
                  <li>
                    <strong>Domain not authorized:</strong> Add {currentUrl} to
                    authorized JavaScript origins
                  </li>
                  <li>
                    <strong>API not enabled:</strong> Enable Google+ API in
                    Google Cloud Console
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="actions">
        <button
          onClick={runSetupChecks}
          className="recheck-button"
          disabled={loading}
        >
          {loading ? "⏳ Checking..." : "🔄 Re-check Configuration"}
        </button>
        {allChecksPass && (
          <div className="success-message">
            <p>🎉 Great! Your Google OAuth is properly configured.</p>
            <p>You can now use Google Sign-In in your authentication pages.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSetupCheck;
