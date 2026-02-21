import React, { useState, useEffect } from 'react';
import { maintenanceAPI, vehicleAPI } from '../services/api';

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_type: 'Oil Change',
    description: '',
    cost: '',
    service_date: new Date().toISOString().split('T')[0],
    odometer_reading: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, vehiclesRes] = await Promise.all([
        maintenanceAPI.getAll(),
        vehicleAPI.getAll()
      ]);
      setLogs(logsRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await maintenanceAPI.create(formData);
      setShowModal(false);
      resetForm();
      fetchData();
      alert('Maintenance log created. Vehicle status updated to "In Shop"');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create maintenance log');
    }
  };

  const handleComplete = async (vehicleId) => {
    if (window.confirm('Mark maintenance as complete and return vehicle to service?')) {
      try {
        await maintenanceAPI.complete(vehicleId);
        fetchData();
        alert('Vehicle returned to service');
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to complete maintenance');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: '',
      service_type: 'Oil Change',
      description: '',
      cost: '',
      service_date: new Date().toISOString().split('T')[0],
      odometer_reading: ''
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Maintenance Logs</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Add Maintenance
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Vehicle</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Service Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Cost</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Odometer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t hover:bg-light/30">
                <td className="px-4 py-3">{new Date(log.service_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{log.license_plate}</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    {log.service_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{log.description}</td>
                <td className="px-4 py-3 font-semibold text-primary">₹{parseFloat(log.cost).toFixed(2)}</td>
                <td className="px-4 py-3">{log.odometer_reading} km</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleComplete(log.vehicle_id)}
                    className="text-green-600 hover:underline font-semibold"
                  >
                    Complete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-primary">Add Maintenance Log</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Vehicle</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.model_name} - {v.license_plate}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Service Type</label>
                <select
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                >
                  <option value="Oil Change">Oil Change</option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Description</label>
                <textarea
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Service Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.service_date}
                  onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Odometer Reading (km)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.odometer_reading}
                  onChange={(e) => setFormData({ ...formData, odometer_reading: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
