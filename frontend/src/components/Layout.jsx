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
      <aside className="w-64 bg-primary shadow-2xl">
        <div className="p-6 border-b border-accent">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">FleetFlow</h1>
          </div>
          <p className="text-sm text-accent">{user?.full_name}</p>
          <p className="text-xs text-light opacity-75">{user?.role?.replace('_', ' ')}</p>
        </div>
        
        <nav className="p-4">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                  isActive 
                    ? 'bg-accent text-primary shadow-lg transform scale-105' 
                    : 'text-light hover:bg-primary-dark hover:bg-opacity-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-accent">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-secondary hover:bg-secondary hover:bg-opacity-10 rounded-xl transition-all font-medium"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-light">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
