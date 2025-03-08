import React from 'react';
import React, { useState, useEffect } from "react";
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
import api from "./api"

function APP() {

//     const loadJournals = async () => {
//     try {
//       const response = await api.get("/journals/");
//       setJournals(Array.isArray(response.data) ? response.data : []);
//     } catch (error) {
//       console.error("Error fetching journals:", error);
//     }
//   };

//   const [journals, setJournals] = useState(loadJournals);


//   // Function to update journal
//   const updateJournal = async (id, updatedJournal) => {
//     try {
//       const response = await api.put(`/journals/${id}`, updatedJournal);
//       setJournals((prevJournals) =>
//         prevJournals.map((journal) =>
//           journal.id === id ? response.data : journal
//         )
//       );
//       console.log("Journal updated:", response.data);
//     } catch (error) {
//       console.error("Error updating journal:", error);
//     }
//   };

 
  return (
    <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
            
//           <Route
//             path="/journals"
//             element={
//               <JournalPage
//                 journals={journals}
//                 addJournal={addJournal}
//                 deleteJournal={deleteJournal}
//                 updateJournal={updateJournal}  // Pass the update function as a prop
//               />
            }
          />
        </Routes>
    </Router>
  );
}

export default App;
