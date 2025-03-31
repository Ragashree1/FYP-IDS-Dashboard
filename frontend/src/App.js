import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import OffencesPage from './OffencesPage';
import DashboardPage from './DashboardPage';
import ReportsPage from './ReportsPage';
import EventLogPage from './EventLogPage';
import SystemConfigurationPage from "./SystemConfigurationPage";
import BlocklistManagementPage from "./BlocklistManagementPage";
import RolesAndPermissionPage from "./RolesAndPermissionPage";
import UserManagementPage from "./UserManagementPage";
import LandingPage from "./LandingPage";
import RegistrationPage from "./RegistrationPage";
import PaymentPage from "./PaymentPage";
import Sidebar from "./Sidebar";
import TrainModelPage from "./TrainModelPage";
import TrainedModelsPage from "./TrainedModelsPage";
import PlayBooksPage from "./PlayBooksPage";
import OrganizationRequestsPage from "./OrganizationRequestsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/landingPage" replace />} />
        <Route path="/landingPage" element={<LandingPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/login" element={<LoginPage />} />
<<<<<<< Updated upstream
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/offences" element={<OffencesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/event-log" element={<EventLogPage />} />
        <Route path="/system-config" element={<SystemConfigurationPage />} />
        <Route path="/blocklist" element={<BlocklistManagementPage />} />
        <Route path="/roles-permission" element={<RolesAndPermissionPage />} />
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/train-model" element={<TrainModelPage />} />
        <Route path="/trained-models" element={<TrainedModelsPage />} />
		<Route path="/playbooks" element={<PlayBooksPage />} />
=======

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles-permission"
          element={
            <ProtectedRoute>
              <RolesAndPermissionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<ProtectedRoute> <DashboardPage />   </ProtectedRoute>   }  />
        <Route path="/offences" element={<ProtectedRoute> <OffencesPage />   </ProtectedRoute>   }  />
        <Route path="/reports" element={<ProtectedRoute> <ReportsPage />   </ProtectedRoute>   }  />
        <Route path="/event-log" element={<ProtectedRoute> <EventLogPage />   </ProtectedRoute>   }  />
        <Route path="/system-config" element={<ProtectedRoute> <SystemConfigurationPage />   </ProtectedRoute>   }  />
        <Route path="/blocklist" element={<ProtectedRoute> <BlocklistManagementPage />   </ProtectedRoute>   }  />
        <Route path="/roles-permission" element={<ProtectedRoute> <RolesAndPermissionPage />   </ProtectedRoute>   }  />
        <Route path="/user-management" element={<ProtectedRoute> <UserManagementPage />   </ProtectedRoute>   }  />
        <Route path="/sidebar" element={<ProtectedRoute> <Sidebar />   </ProtectedRoute>   }  />
        <Route path="/train-model" element={<ProtectedRoute> <TrainModelPage />   </ProtectedRoute>   }  />
        <Route path="/trained-models" element={<ProtectedRoute> <TrainedModelsPage />   </ProtectedRoute>   }  />
		<Route path="/playbooks" element={<ProtectedRoute> <PlayBooksPage />   </ProtectedRoute>   }  />
	    <Route path="/organization-requests" element={<OrganizationRequestsPage />} />
        {/* Add other protected routes here */}
>>>>>>> Stashed changes
      </Routes>
    </Router>
  );
}

export default App;
