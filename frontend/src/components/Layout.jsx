import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiTruck, FiMap, FiTool, FiDollarSign, FiUsers, FiBarChart2, FiLogOut } from 'react-icons/fi';
import { getUser, clearAuth, hasRole, ROLES } from '../utils/auth';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard', roles: ['all'] },
    { path: '/vehicles', icon: FiTruck, label: 'Vehicles', roles: ['all'] },
    { path: '/trips', icon: FiMap, label: 'Trips', roles: [ROLES.DISPATCHER, ROLES.FLEET_MANAGER] },
    { path: '/maintenance', icon: FiTool, label: 'Maintenance', roles: [ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER] },
    { path: '/expenses', icon: FiDollarSign, label: 'Expenses', roles: [ROLES.FINANCIAL_ANALYST, ROLES.FLEET_MANAGER] },
    { path: '/drivers', icon: FiUsers, label: 'Drivers', roles: [ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER, ROLES.DISPATCHER] },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics', roles: ['all'] },
    { path: '/users', icon: FiUsers, label: 'User Management', roles: [ROLES.FLEET_MANAGER] },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes('all') || hasRole(item.roles)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">Fleet Manager</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.full_name}</p>
          <p className="text-xs text-gray-500">{user?.role?.replace('_', ' ')}</p>
        </div>
        
        <nav className="p-4">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
