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
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProblemDetails from "./pages/ProblemDetails";
import AdminAuth from "./pages/auth/AdminAuth";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCreateProblem from "./AdminCreateProblem";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="route-container">
            <Routes>
              {/* Authentication routes */}
              <Route path="/auth/signin" element={
                <div className="full-width-content">
                  <SignIn />
                </div>
              } />
              <Route path="/auth/register" element={
                <div className="full-width-content">
                  <Register />
                </div>
              } />
              <Route path="/auth/forgot-password" element={
                <div className="full-width-content">
                  <ForgotPassword />
                </div>
              } />
              <Route
                path="/auth/reset-password/:uid/:token"
                element={
                  <div className="full-width-content">
                    <ResetPassword />
                  </div>
                }
              />
              {/* <Route path="/auth/setup" element={
                <div className="full-width-content">
                  <AuthSetupCheck />
                </div>
              } /> */}

              {/* Main application routes */}
              <Route path="/" element={
                <div className="home-container">
                  <header>
                    <h1>One must imagine Sisyphus🥀</h1>
                  </header>
                  <section className="content-wrapper">
                    <ProblemsList />
                    {/* <AuthSetupCheck /> */}
                  </section>
                </div>
              } />

              {/* Redirect /auth to /auth/signin */}
              <Route path="/auth" element={<Navigate to="/auth/signin" replace />} />

              <Route path="problem/:id" element={
                <div className="content-wrapper">
                  <ProblemDetails />
                </div>
              } />

              {/* Admin routes */}
              <Route path="/admin" element={
                <div className="full-width-content">
                  <AdminAuth />
                </div>
              } />
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <div className="content-wrapper">
                    <AdminDashboard />
                  </div>
                </AdminRoute>
              } />
              <Route path="/admin/problems/create" element={
                <AdminRoute>
                  <div className="content-wrapper">
                    <AdminCreateProblem />
                  </div>
                </AdminRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
