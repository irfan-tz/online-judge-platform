import { useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./Auth.css";

// GraphQL mutation for reset password
const RESET_PASSWORD = gql`
  mutation ResetPassword($uid: String!, $token: String!, $password: String!) {
    resetPassword(uid: $uid, token: $token, password: $password) {
      success
      message
    }
  }
`;

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetPassword, { loading, error }] = useMutation(RESET_PASSWORD);

  useEffect(() => {
    if (!token || !uid) {
      navigate("/auth/forgot-password");
    }
  }, [token, uid, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const { data } = await resetPassword({
        variables: {
          uid,
          token,
          password: formData.password,
        },
      });

      if (data?.resetPassword?.success) {
        setIsSuccess(true);
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          navigate("/auth/signin");
        }, 3000);
      }
    } catch (err) {
      console.error("Reset password error:", err);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return "";

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength < 3) return "weak";
    if (strength < 4) return "medium";
    return "strong";
  };

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-background">
          <div className="auth-card">
            <div className="auth-header success">
              <div className="success-icon">🎉</div>
              <h1>Password Reset Successful!</h1>
              <p>Your password has been successfully updated.</p>
            </div>

            <div className="auth-form">
              <div className="success-message">
                <p>You can now sign in with your new password.</p>
                <p>Redirecting to sign in page in 3 seconds...</p>
              </div>

              <Link to="/auth/signin" className="auth-button primary">
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !uid) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Reset Your Password</h1>
            <p>Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your new password"
                  className={`form-input ${validationErrors.password ? "error" : ""}`}
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {formData.password && (
                <div className={`password-strength ${getPasswordStrength()}`}>
                  <div className="strength-meter">
                    <div className="strength-fill"></div>
                  </div>
                  <span className="strength-text">
                    {getPasswordStrength().charAt(0).toUpperCase() +
                      getPasswordStrength().slice(1)}{" "}
                    password
                  </span>
                </div>
              )}
              {validationErrors.password && (
                <span className="field-error">{validationErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your new password"
                  className={`form-input ${validationErrors.confirmPassword ? "error" : ""}`}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <span className="field-error">
                  {validationErrors.confirmPassword}
                </span>
              )}
            </div>

            {error && <div className="error-message">{error.message}</div>}

            <button
              type="submit"
              disabled={loading}
              className="auth-button primary"
            >
              {loading ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                "Update Password"
              )}
            </button>

            <div className="auth-footer">
              <p>
                Remember your password?{" "}
                <Link to="/auth/signin" className="auth-link">
                  Back to Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
