import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import ProblemsList from "./components/ProblemsList";
import Navbar from "./components/Navbar";
import AuthSetupCheck from "./components/AuthSetupCheck";
import { SignIn, Register, ForgotPassword, ResetPassword } from "./pages/auth";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Authentication routes */}
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/auth/reset-password/:uid/:token"
              element={<ResetPassword />}
            />
            <Route path="/auth/setup" element={<AuthSetupCheck />} />

            {/* Main application routes */}
            <Route
              path="/"
              element={
                <div>
                  <h1>Online Judge Platform</h1>
                  <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <Link
                      to="/auth/setup"
                      style={{ margin: "0 1rem", color: "#667eea" }}
                    >
                      🔧 OAuth Setup Check
                    </Link>
                  </div>
                  <ProblemsList />
                </div>
              }
            />

            {/* Redirect /auth to /auth/signin */}
            <Route
              path="/auth"
              element={<Navigate to="/auth/signin" replace />}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
