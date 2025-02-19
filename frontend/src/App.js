import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import OffencesPage from './OffencesPage';
import DashboardPage from './DashboardPage';
import ReportsPage from './ReportsPage';
import EventLogPage from './EventLogPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
		<Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/offences" element={<OffencesPage />} />
		<Route path="/reports" element={<ReportsPage />} />
		<Route path="/event-log" element={<EventLogPage />} />
      </Routes>
    </Router>
  );
}

export default App;