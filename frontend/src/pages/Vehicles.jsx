import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../services/api';
import { hasRole, ROLES } from '../utils/auth';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    model_name: '',
    license_plate: '',
    vehicle_type: 'Truck',
    max_load_capacity: '',
    region: '',
    acquisition_cost: '',
    odometer: 0,
    status: 'Available'
  });

  const canManage = hasRole([ROLES.FLEET_MANAGER]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await vehicleAPI.update(editingVehicle.id, formData);
        setSuccessMessage('Vehicle updated successfully!');
      } else {
        await vehicleAPI.create(formData);
        setSuccessMessage('Vehicle created successfully!');
      }
      setShowModal(false);
      setEditingVehicle(null);
      resetForm();
      fetchVehicles();
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Operation failed');
      setShowErrorModal(true);
    }
  };

  const handleRetire = async () => {
    try {
      await vehicleAPI.retire(selectedVehicleId);
      fetchVehicles();
      setSuccessMessage('Vehicle retired successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to retire vehicle');
      setShowErrorModal(true);
    }
  };

  const handleDelete = async () => {
    try {
      await vehicleAPI.delete(selectedVehicleId);
      fetchVehicles();
      setSuccessMessage('Vehicle deleted successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to delete vehicle');
      setShowErrorModal(true);
    }
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      model_name: '',
      license_plate: '',
      vehicle_type: 'Truck',
      max_load_capacity: '',
      region: '',
      acquisition_cost: '',
      odometer: 0,
      status: 'Available'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Vehicle Registry</h1>
        {canManage && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Vehicle
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Model</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">License Plate</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Max Capacity</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Odometer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              {canManage && <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-t hover:bg-light/30">
                <td className="px-4 py-3">{vehicle.model_name}</td>
                <td className="px-4 py-3 font-mono">{vehicle.license_plate}</td>
                <td className="px-4 py-3">{vehicle.vehicle_type}</td>
                <td className="px-4 py-3">{vehicle.max_load_capacity} kg</td>
                <td className="px-4 py-3">{vehicle.odometer} km</td>
                <td className="px-4 py-3"><StatusBadge status={vehicle.status} /></td>
                {canManage && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEditModal(vehicle)}
                      className="text-primary hover:underline mr-3 font-semibold"
                    >
                      Edit
                    </button>
                    {vehicle.status !== 'Retired' && (
                      <button
                        onClick={() => {
                          setSelectedVehicleId(vehicle.id);
                          setShowRetireModal(true);
                        }}
                        className="text-yellow-600 hover:underline mr-3 font-semibold"
                      >
                        Retire
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedVehicleId(vehicle.id);
                        setShowDeleteModal(true);
                      }}
                      className="text-secondary hover:underline font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Model Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.model_name}
                  onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">License Plate</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Vehicle Type</label>
                <select
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                >
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Bike">Bike</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Max Load Capacity (kg)</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.max_load_capacity}
                  onChange={(e) => setFormData({ ...formData, max_load_capacity: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Region</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                />
              </div>
              {editingVehicle && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-primary">Odometer (km)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.odometer}
                      onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-primary">Status</label>
                    <select
                      className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Available">Available</option>
                      <option value="On Trip">On Trip</option>
                      <option value="In Shop">In Shop</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingVehicle ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingVehicle(null); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Retire Confirmation Modal */}
      <ConfirmModal
        isOpen={showRetireModal}
        onClose={() => setShowRetireModal(false)}
        onConfirm={handleRetire}
        title="Retire Vehicle"
        message="Are you sure you want to retire this vehicle? It will be marked as out of service."
        confirmText="Yes, Retire"
        cancelText="Cancel"
        type="warning"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        type="success"
      >
        {successMessage}
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        type="error"
      >
        {errorMessage}
      </Modal>
    </div>
  );
};

export default Vehicles;
