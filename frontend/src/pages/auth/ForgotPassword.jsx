import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import "./Auth.css";

// GraphQL mutation for forgot password
const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [forgotPassword, { loading, error }] = useMutation(FORGOT_PASSWORD);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await forgotPassword({
        variables: { email },
      });

      if (data?.forgotPassword?.success) {
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-background">
          <div className="auth-card">
            <div className="auth-header success">
              <div className="success-icon">📧</div>
              <h1>Check Your Email</h1>
              <p>
                We've sent a password reset link to{" "}
                <strong>{email}</strong>
              </p>
            </div>

            <div className="auth-form">
              <div className="success-message">
                <p>
                  If an account with that email exists, you'll receive a password
                  reset link within a few minutes.
                </p>
                <p>
                  Don't see the email? Check your spam folder or{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setIsSubmitted(false)}
                  >
                    try again
                  </button>
                </p>
              </div>

              <div className="auth-footer">
                <p>
                  Remember your password?{" "}
                  <Link to="/auth/signin" className="auth-link">
                    Back to Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Forgot Password?</h1>
            <p>
              No worries! Enter your email address and we'll send you a link to
              reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="form-input"
                autoFocus
              />
              <small className="form-hint">
                We'll send reset instructions to this email
              </small>
            </div>

            {error && (
              <div className="error-message">
                {error.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="auth-button primary"
            >
              {loading ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-footer">
              <p>
                Remember your password?{" "}
                <Link to="/auth/signin" className="auth-link">
                  Back to Sign In
                </Link>
              </p>
              <p>
                Don't have an account?{" "}
                <Link to="/auth/register" className="auth-link">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
