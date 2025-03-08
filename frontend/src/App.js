import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import OffencesPage from './OffencesPage';
import DashboardPage from './DashboardPage';
import ReportsPage from './ReportsPage';
import EventLogPage from './EventLogPage';
import SystemConfigurationPage from "./SystemConfigurationPage"
import BlocklistManagementPage from "./BlocklistManagementPage"
import RolesAndPermissionPage from "./RolesAndPermissionPage"
import UserManagementPage from "./UserManagementPage"
import LandingPage from "./LandingPage"
import LogsDashboard from "./pages/LogsDashboard";
//import api from "./api"

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/logs" element={<LogsDashboard/>} /> 
          <Route path="/" element={<Navigate to="/LandingPage" replace />} />
		      <Route path="/landingPage" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
		      <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/offences" element={<OffencesPage />} />
		      <Route path="/reports" element={<ReportsPage />} />
		      <Route path="/event-log" element={<EventLogPage />} />
		      <Route path="/system-config" element={<SystemConfigurationPage />} />
		      <Route path="/blocklist" element={<BlocklistManagementPage />} />
		      <Route path="/roles-permission" element={<RolesAndPermissionPage />} />
		      <Route path="/user-management" element={<UserManagementPage />} />
        </Routes>
    </Router>
  );
}

export default App;
