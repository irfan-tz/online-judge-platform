import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isAuthPage = location.pathname.startsWith("/auth");

  if (isAuthPage) {
    return null; // Don't show navbar on auth pages
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and brand */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">⚖️</span>
            <span className="brand-text">Online Judge</span>
          </Link>
        </div>

        {/* Navigation links */}
        <div className="navbar-nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Problems
          </Link>
          <Link
            to="/contests"
            className={`nav-link ${location.pathname === "/contests" ? "active" : ""}`}
          >
            Contests
          </Link>
          <Link
            to="/leaderboard"
            className={`nav-link ${location.pathname === "/leaderboard" ? "active" : ""}`}
          >
            Leaderboard
          </Link>
        </div>

        {/* Authentication section */}
        <div className="navbar-auth">
          {isLoading ? (
            <div className="auth-loading">
              <span className="loading-spinner">⏳</span>
            </div>
          ) : isAuthenticated ? (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.firstName
                    ? user.firstName.charAt(0).toUpperCase()
                    : user?.username
                      ? user.username.charAt(0).toUpperCase()
                      : "👤"}
                </div>
                <div className="user-details">
                  <span className="user-name">
                    {user?.firstName
                      ? `${user.firstName} ${user.lastName || ""}`.trim()
                      : user?.username || "User"}
                  </span>
                  <span className="user-email">{user?.email}</span>
                </div>
              </div>
              <div className="user-actions">
                <Link to="/profile" className="user-action-link">
                  Profile
                </Link>
                <Link to="/submissions" className="user-action-link">
                  Submissions
                </Link>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/auth/signin" className="auth-button signin">
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="mobile-menu-toggle">
          <button className="hamburger-menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
