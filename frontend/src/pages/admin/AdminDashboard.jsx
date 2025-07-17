import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.firstName || user?.username || 'Administrator'}!</p>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Problems</h3>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <h3>Users</h3>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <h3>Submissions</h3>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <h3>Contests</h3>
          <div className="stat-value">0</div>
        </div>
      </div>

      <div className="admin-sections">
        <section className="admin-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/admin/problems/create" className="admin-btn primary">Create Problem</Link>
            <button className="admin-btn">Create Contest</button>
            <button className="admin-btn">Manage Users</button>
            <button className="admin-btn">View Submissions</button>
          </div>
        </section>

        <section className="admin-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <p>No recent activity to display.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
