import React, { useState, useEffect } from 'react';
import { driverAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    license_number: '',
    license_expiry_date: '',
    phone: '',
    safety_score: 100,
    status: 'Off Duty'
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await driverAPI.getAll();
      setDrivers(response.data);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await driverAPI.update(editingDriver.id, formData);
      } else {
        await driverAPI.create(formData);
      }
      setShowModal(false);
      setEditingDriver(null);
      resetForm();
      fetchDrivers();
    } catch (error) {
      alert(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleViewPerformance = async (id) => {
    try {
      const response = await driverAPI.getPerformance(id);
      setPerformanceData(response.data);
    } catch (error) {
      alert('Failed to fetch performance data');
    }
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setFormData({
      full_name: driver.full_name,
      license_number: driver.license_number,
      license_expiry_date: driver.license_expiry_date.split('T')[0],
      phone: driver.phone,
      safety_score: driver.safety_score,
      status: driver.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      license_number: '',
      license_expiry_date: '',
      phone: '',
      safety_score: 100,
      status: 'Off Duty'
    });
  };

  const isLicenseExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Driver Performance & Safety</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Driver
        </button>
      </div>

      {performanceData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-3">Driver Performance: {performanceData.full_name}</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold">{performanceData.total_trips}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Trips</p>
              <p className="text-2xl font-bold text-green-600">{performanceData.completed_trips}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-blue-600">{parseFloat(performanceData.completion_rate).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Safety Score</p>
              <p className="text-2xl font-bold text-purple-600">{parseFloat(performanceData.safety_score).toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={() => setPerformanceData(null)}
            className="mt-4 text-green-600 hover:underline text-sm"
          >
            Close
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">License Number</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">License Expiry</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Safety Score</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => {
              const expired = isLicenseExpired(driver.license_expiry_date);
              return (
                <tr key={driver.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{driver.full_name}</td>
                  <td className="px-4 py-3 font-mono">{driver.license_number}</td>
                  <td className="px-4 py-3">
                    <span className={expired ? 'text-red-600 font-bold' : ''}>
                      {new Date(driver.license_expiry_date).toLocaleDateString()}
                      {expired && ' (EXPIRED)'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{driver.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${
                      driver.safety_score >= 90 ? 'text-green-600' :
                      driver.safety_score >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {parseFloat(driver.safety_score).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={driver.status} /></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEditModal(driver)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewPerformance(driver.id)}
                      className="text-green-600 hover:underline"
                    >
                      Performance
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingDriver ? 'Edit Driver' : 'Add Driver'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">License Number</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">License Expiry Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.license_expiry_date}
                  onChange={(e) => setFormData({ ...formData, license_expiry_date: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              {editingDriver && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Safety Score</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.safety_score}
                      onChange={(e) => setFormData({ ...formData, safety_score: e.target.value })}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Status</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="On Duty">On Duty</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  {editingDriver ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingDriver(null); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
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

export default Drivers;
