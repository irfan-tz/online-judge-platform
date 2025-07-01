import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";
import GoogleAuth from "../../components/GoogleAuth";
import { useAuth } from "../../contexts/AuthContext";
import "./Auth.css";

// GraphQL mutation for registration
const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      token
      user {
        id
        email
        username
      }
    }
  }
`;

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [register, { loading, error }] = useMutation(REGISTER);
  const { login } = useAuth();
  const navigate = useNavigate();

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

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

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
      const { data } = await register({
        variables: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        },
      });

      // Use auth context to manage authentication state
      const result = login({
        user: data.register.user,
        token: data.register.token,
      });

      if (result.success) {
        navigate("/");
      }
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  const handleGoogleSuccess = (authData) => {
    // Use auth context to manage authentication state
    const result = login({
      user: authData.user,
      token: authData.token,
    });

    if (result.success) {
      navigate("/");
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google authentication error:", error);
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

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-card register-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join the Online Judge community</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Choose a username"
                className={`form-input ${validationErrors.username ? "error" : ""}`}
              />
              {validationErrors.username && (
                <span className="field-error">{validationErrors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className={`form-input ${validationErrors.email ? "error" : ""}`}
              />
              {validationErrors.email && (
                <span className="field-error">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a strong password"
                  className={`form-input ${validationErrors.password ? "error" : ""}`}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👀" : "🕶️"}
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
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  className={`form-input ${validationErrors.confirmPassword ? "error" : ""}`}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👀" : "🕶️"}
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
                "Create Account"
              )}
            </button>

            <div className="terms-notice">
              <p>
                By creating an account, you agree to our{" "}
                <Link to="/terms" className="auth-link">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="auth-link">
                  Privacy Policy
                </Link>
              </p>
            </div>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <GoogleAuth
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={loading}
            />

            <div className="auth-footer">
              <p>
                Already have an account?{" "}
                <Link to="/auth/signin" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
