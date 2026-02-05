import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import CreateCheckin from './components/CreateCheckin';
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
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Care Note 💚</h1>
          </Link>
          {user && (
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
          )}
        </div>
      </div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkin/:id" element={<FillCheckin />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <CreateCheckin />
            </ProtectedRoute>
          }
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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
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

