import React, { useState, useEffect } from 'react';
import { dashboardAPI, vehicleAPI } from '../services/api';
import { FiTruck, FiAlertCircle, FiActivity, FiPackage } from 'react-icons/fi';

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({ type: '', status: '', region: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [kpiRes, vehicleRes] = await Promise.all([
        dashboardAPI.getKPIs(),
        vehicleAPI.getAll(filters)
      ]);
      setKpis(kpiRes.data);
      setVehicles(vehicleRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Command Center Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FiTruck}
          title="Active Fleet"
          value={kpis?.active_fleet || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={FiAlertCircle}
          title="Maintenance Alerts"
          value={kpis?.maintenance_alerts || 0}
          color="bg-yellow-500"
        />
        <StatCard
          icon={FiActivity}
          title="Utilization Rate"
          value={`${kpis?.utilization_rate || 0}%`}
          color="bg-green-500"
        />
        <StatCard
          icon={FiPackage}
          title="Pending Cargo"
          value={kpis?.pending_cargo || 0}
          color="bg-purple-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Fleet Overview</h2>

        <div className="flex gap-4 mb-6">
          <select
            className="px-4 py-2 border rounded-lg"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Bike">Bike</option>
          </select>

          <select
            className="px-4 py-2 border rounded-lg"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          <select
            className="px-4 py-2 border rounded-lg"
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          >
            <option value="">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Model</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">License Plate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Region</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Odometer</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{vehicle.model_name}</td>
                  <td className="px-4 py-3 font-mono">{vehicle.license_plate}</td>
                  <td className="px-4 py-3">{vehicle.vehicle_type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      vehicle.status === 'Available' ? 'bg-green-100 text-green-800' :
                      vehicle.status === 'On Trip' ? 'bg-blue-100 text-blue-800' :
                      vehicle.status === 'In Shop' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{vehicle.region}</td>
                  <td className="px-4 py-3">{vehicle.odometer} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
