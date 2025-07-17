import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import GoogleAuth from "../../components/GoogleAuth";
import { useAuth } from "../../contexts/AuthContext";
import "./Auth.css";

// GraphQL mutation for sign in
const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
      user {
        id
        email
        username
      }
    }
  }
`;

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [signIn, { loading, error }] = useMutation(SIGN_IN);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await signIn({
        variables: {
          email: formData.email,
          password: formData.password,
        },
      });

      // Use auth context to manage authentication state
      const result = login({
        user: data.signIn.user,
        token: data.signIn.token,
      });

      if (result.success) {
        navigate("/");
      }
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  const handleGoogleSuccess = (authData) => {
    // Use auth context to manage authentication state
    const result = login({
      user: authData.user,
      token: authData.token,
    });

    if (result.success) {
      navigate(redirectUrl);
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google authentication error:", error);
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to your Online Judge account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
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
                className="form-input"
              />
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
                  placeholder="Enter your password"
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👀" : "🕶️"}
                </button>
              </div>
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
                "Sign In"
              )}
            </button>

            <div className="auth-links">
              <Link to="/auth/forgot-password" className="forgot-password-link">
                Forgot your password?
              </Link>
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

export default SignIn;
