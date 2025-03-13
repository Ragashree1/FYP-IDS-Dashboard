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
import RegistrationPage from "./RegistrationPage"
import PaymentPage from "./PaymentPage"
import Sidebar from "./Sidebar"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/LandingPage" replace />} />
		    <Route path="/landingPage" element={<LandingPage />} />
		    <Route path="/register" element={<RegistrationPage />} />
		    <Route path="/payment" element={<PaymentPage />} />
        <Route path="/login" element={<LoginPage />} />
		    <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/offences" element={<OffencesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/event-log" element={<EventLogPage />} />
        <Route path="/system-config" element={<SystemConfigurationPage />} />
        <Route path="/blocklist" element={<BlocklistManagementPage />} />
        <Route path="/roles-permission" element={<RolesAndPermissionPage />} />
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="/Sidebar" element={<Sidebar />} />
      </Routes>
    </Router>
  );
}

export default App;

