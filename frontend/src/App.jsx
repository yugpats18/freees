import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUser, ROLES } from './utils/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Drivers from './pages/Drivers';
import Analytics from './pages/Analytics';
import DriverPortal from './pages/DriverPortal';
import UserManagement from './pages/UserManagement';

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const DriverRoute = ({ children }) => {
  const user = getUser();
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (user?.role === ROLES.DRIVER) return children;
  return <Navigate to="/dashboard" />;
};

const AdminRoute = ({ children }) => {
  const user = getUser();
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (user?.role === ROLES.DRIVER) return <Navigate to="/driver" />;
  return children;
};

function App() {
  const user = getUser();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Driver Portal Route */}
        <Route
          path="/driver"
          element={
            <DriverRoute>
              <DriverPortal />
            </DriverRoute>
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="/*"
          element={
            <AdminRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/trips" element={<Trips />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/drivers" element={<Drivers />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/users" element={<UserManagement />} />
                </Routes>
              </Layout>
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
