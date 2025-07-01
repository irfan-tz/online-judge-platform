import { useEffect, useRef, useState } from "react";
import { useMutation, gql } from "@apollo/client";
import "./GoogleAuth.css";

// GraphQL mutation for Google OAuth
const GOOGLE_AUTH = gql`
  mutation GoogleAuth($token: String!) {
    googleAuth(token: $token) {
      token
      user {
        id
        email
        username
        firstName
        lastName
      }
    }
  }
`;

const GoogleAuth = ({ onSuccess, onError, disabled = false }) => {
  const googleButtonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleAuth] = useMutation(GOOGLE_AUTH);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      try {
        // Debug logging
        console.log("=== Google OAuth Debug Info ===");
        console.log("Current origin:", window.location.origin);
        console.log("Current URL:", window.location.href);
        console.log("Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
        console.log("==============================");

        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: "100%",
          });
        }
      } catch (error) {
        console.error("Google Sign-In initialization error:", error);
        onError &&
          onError(
            new Error(
              "Failed to initialize Google Sign-In. Please check your configuration.",
            ),
          );
      }
    }
  };

  const handleCredentialResponse = async (response) => {
    if (!response.credential) {
      onError && onError(new Error("No credential received from Google"));
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await googleAuth({
        variables: {
          token: response.credential,
        },
      });

      if (data?.googleAuth?.token) {
        // Store token in localStorage
        localStorage.setItem("token", data.googleAuth.token);
        localStorage.setItem("user", JSON.stringify(data.googleAuth.user));

        onSuccess && onSuccess(data.googleAuth);
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error) {
      console.error("Google authentication error:", error);
      onError && onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSignIn = () => {
    if (window.google && !disabled && !isLoading) {
      setIsLoading(true);
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsLoading(false);
          onError &&
            onError(new Error("Google Sign-In was cancelled or not displayed"));
        }
      });
    }
  };

  return (
    <div className="google-auth-container">
      <div className="google-auth-wrapper">
        {/* Google's rendered button */}
        <div
          ref={googleButtonRef}
          className={`google-signin-button ${disabled ? "disabled" : ""} ${isLoading ? "loading" : ""}`}
          style={{ display: isLoading ? "none" : "block" }}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="google-auth-loading">
            <div className="loading-spinner">⏳</div>
            <span>Signing in with Google...</span>
          </div>
        )}
      </div>

      {/* Environment variable warning for development */}
      {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <div className="google-auth-warning">
          <p>⚠️ Google Client ID not configured</p>
        </div>
      )}
    </div>
  );
};

export default GoogleAuth;
