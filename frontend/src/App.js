import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateCheckin from './components/CreateCheckin';
import FillCheckin from './components/FillCheckin';
import CareReport from './components/CareReport';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="app-header">
          <div className="app-header-content">
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>Care Note 💚</h1>
            </Link>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<CreateCheckin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkin/:id" element={<FillCheckin />} />
          <Route path="/report/:checkinId" element={<CareReport />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

