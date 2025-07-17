import React, { useState } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { useAuth } from "../../contexts/AuthContext";

const ADMIN_LOGIN_MUTATION = gql`
  mutation AdminLogin($username: String!, $password: String!) {
    adminLogin(username: $username, password: $password) {
      token
      isStaff
    }
  }
`;

const AdminAuth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [adminLogin] = useMutation(ADMIN_LOGIN_MUTATION);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await adminLogin({
        variables: { username, password },
      });
      if (data.adminLogin.isStaff) {
        // Get current user from local storage if exists
        const existingUserStr = localStorage.getItem("user");
        const existingUser = existingUserStr ? JSON.parse(existingUserStr) : null;

        // Prepare user data with admin status
        const userData = {
          user: existingUser || { username, isStaff: true },
          token: existingUser ? localStorage.getItem("token") : data.adminLogin.token,
          adminToken: data.adminLogin.token
        };

        // Update user state with admin token
        const result = login(userData);

        if (result.success) {
          navigate("/admin/dashboard");
        } else {
          setError("Failed to update admin session.");
        }
      } else {
        setError("You are not authorized to access this page.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Invalid credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Admin Login</h1>
          {error && <div className="error-message">{error}</div>}
        </div>
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="form-input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="auth-button primary" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;