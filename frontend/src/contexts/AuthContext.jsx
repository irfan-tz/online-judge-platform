import { createContext, useContext, useReducer, useEffect } from "react";
import Cookies from "js-cookie";

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  CLEAR_ERROR: "CLEAR_ERROR",
  UPDATE_USER: "UPDATE_USER",
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token") || Cookies.get("token");
        const userStr = localStorage.getItem("user") || Cookies.get("user");

        if (token && userStr) {
          const user = JSON.parse(userStr);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token },
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: "Failed to initialize authentication",
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = (userData) => {
    try {
      const { user, token } = userData;

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Store in cookies (for server-side access)
      Cookies.set("token", token, { expires: 7, secure: true, sameSite: "strict" });
      Cookies.set("user", JSON.stringify(user), { expires: 7, secure: true, sameSite: "strict" });

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || "Login failed",
      });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Clear cookies
      Cookies.remove("token");
      Cookies.remove("user");

      dispatch({ type: AUTH_ACTIONS.LOGOUT });

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  // Update user function
  const updateUser = (userData) => {
    try {
      const updatedUser = { ...state.user, ...userData };

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update cookies
      Cookies.set("user", JSON.stringify(updatedUser), { expires: 7, secure: true, sameSite: "strict" });

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updatedUser,
      });

      return { success: true };
    } catch (error) {
      console.error("Update user error:", error);
      return { success: false, error: error.message };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.roles?.includes(role) || false;
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return state.user?.permissions?.includes(permission) || false;
  };

  // Get auth header for API requests
  const getAuthHeader = () => {
    return state.token ? { Authorization: `Bearer ${state.token}` } : {};
  };

  // Check if token is expired (basic check)
  const isTokenExpired = () => {
    if (!state.token) return true;

    try {
      const payload = JSON.parse(atob(state.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  };

  // Verify authentication status
  const verifyAuth = async () => {
    if (!state.token || isTokenExpired()) {
      logout();
      return false;
    }
    return true;
  };

  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    logout,
    updateUser,
    clearError,

    // Utilities
    hasRole,
    hasPermission,
    getAuthHeader,
    isTokenExpired,
    verifyAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// HOC for protected routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="auth-loading">
          <div className="loading-spinner">⏳</div>
          <p>Loading...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please sign in to access this page.</p>
          <a href="/auth/signin" className="auth-link">
            Go to Sign In
          </a>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default AuthContext;
