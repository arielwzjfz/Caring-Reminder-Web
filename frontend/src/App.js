import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import FillCheckin from './components/FillCheckin';
import CareReport from './components/CareReport';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppContent() {
  const { user, logout } = useAuth();

  return (
    <div className="App">
      <div className="app-header">
        <div className="app-header-content">
          <Link to={user ? "/dashboard" : "/login"} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Care Note 💚</h1>
          </Link>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: 'var(--text)', fontSize: '20px' }}>{user.name || user.email}</span>
              <button
                onClick={logout}
                className="btn-secondary"
                style={{ fontSize: '18px', padding: '8px 16px' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link to="/login" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '18px' }}>
                Login
              </Link>
              <Link to="/signup" style={{ color: 'var(--olive)', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkin/:id" element={<FillCheckin />} />
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:checkinId"
          element={
            <ProtectedRoute>
              <CareReport />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

