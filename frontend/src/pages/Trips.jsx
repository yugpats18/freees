import React, { useState, useEffect } from 'react';
import { tripAPI, vehicleAPI, driverAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import InputModal from '../components/InputModal';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [driverCredentials, setDriverCredentials] = useState(null);
  const [showOdometerModal, setShowOdometerModal] = useState(false);
  const [completingTripId, setCompletingTripId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingTripId, setCancellingTripId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    cargo_weight: '',
    origin: '',
    destination: '',
    distance: '',
    revenue: '',
    driver_earnings: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tripRes, vehicleRes, driverRes] = await Promise.all([
        tripAPI.getAll(),
        vehicleAPI.getAll({ status: 'Available' }),
        driverAPI.getAll()
      ]);
      setTrips(tripRes.data);
      setVehicles(vehicleRes.data);
      setDrivers(driverRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await tripAPI.create(formData);
      setShowModal(false);
      resetForm();
      fetchData();
      setSuccessMessage('Trip created successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to create trip');
      setShowErrorModal(true);
    }
  };

  const handleDispatch = async (id) => {
    try {
      const response = await tripAPI.dispatch(id);
      
      // Show driver credentials in modal
      if (response.data.driverCredentials) {
        setDriverCredentials(response.data.driverCredentials);
        setShowCredentialsModal(true);
      }
      
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to dispatch trip');
      setShowErrorModal(true);
    }
  };

  const handleComplete = async (odometerReading) => {
    try {
      await tripAPI.complete(completingTripId, { odometer_reading: parseFloat(odometerReading) });
      fetchData();
      setSuccessMessage('Trip completed successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to complete trip');
      setShowErrorModal(true);
    }
  };

  const handleCancel = async () => {
    try {
      await tripAPI.cancel(cancellingTripId);
      fetchData();
      setSuccessMessage('Trip cancelled successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to cancel trip');
      setShowErrorModal(true);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: '',
      driver_id: '',
      cargo_weight: '',
      origin: '',
      destination: '',
      distance: '',
      revenue: '',
      driver_earnings: ''
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Trip Dispatcher</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Create Trip
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Vehicle</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Driver</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Route</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Cargo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id} className="border-t hover:bg-light/30">
                <td className="px-4 py-3">#{trip.id}</td>
                <td className="px-4 py-3">{trip.license_plate}</td>
                <td className="px-4 py-3">{trip.driver_name}</td>
                <td className="px-4 py-3 text-sm">{trip.origin} → {trip.destination}</td>
                <td className="px-4 py-3">{trip.cargo_weight} kg</td>
                <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
                <td className="px-4 py-3">
                  {trip.status === 'Draft' && (
                    <button
                      onClick={() => handleDispatch(trip.id)}
                      className="text-primary hover:underline mr-3 font-semibold"
                    >
                      Dispatch
                    </button>
                  )}
                  {trip.status === 'Dispatched' && (
                    <button
                      onClick={() => {
                        setCompletingTripId(trip.id);
                        setShowOdometerModal(true);
                      }}
                      className="text-green-600 hover:underline mr-3 font-semibold"
                    >
                      Complete
                    </button>
                  )}
                  {trip.status !== 'Completed' && trip.status !== 'Cancelled' && (
                    <button
                      onClick={() => {
                        setCancellingTripId(trip.id);
                        setShowCancelModal(true);
                      }}
                      className="text-secondary hover:underline font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-primary">Create Trip</h2>
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
                  {vehicles.filter(v => v.status === 'Available').map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.model_name} - {v.license_plate} (Max: {v.max_load_capacity} kg)
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Driver</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.driver_id}
                  onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                >
                  <option value="">Select Driver</option>
                  {drivers.filter(d => d.status !== 'Suspended').map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} - {d.license_number}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Cargo Weight (kg)</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.cargo_weight}
                  onChange={(e) => setFormData({ ...formData, cargo_weight: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Origin</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Destination</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Distance (km)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Revenue (₹)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="Enter revenue in Rupees"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-primary">Driver Earnings (₹)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Amount driver will receive in Rupees"
                  value={formData.driver_earnings}
                  onChange={(e) => setFormData({ ...formData, driver_earnings: e.target.value })}
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

      {/* Driver Credentials Modal */}
      {showCredentialsModal && driverCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Trip Dispatched Successfully!</h2>
              <p className="text-gray-600 text-sm">Share these credentials with the driver</p>
            </div>

            <div className="bg-accent/10 border-2 border-accent rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 text-primary">Driver Login Credentials</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={driverCredentials.username}
                    className="flex-1 px-4 py-2 bg-white border border-accent rounded-lg font-mono text-lg"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(driverCredentials.username);
                      alert('Username copied!');
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Driver enters this WITHOUT @driver.fleet</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={driverCredentials.password}
                    className="flex-1 px-4 py-2 bg-white border border-accent rounded-lg font-mono text-lg"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(driverCredentials.password);
                      alert('Password copied!');
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> {driverCredentials.message}
              </p>
            </div>

            <button
              onClick={() => {
                setShowCredentialsModal(false);
                setDriverCredentials(null);
              }}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Odometer Input Modal */}
      <InputModal
        isOpen={showOdometerModal}
        onClose={() => setShowOdometerModal(false)}
        onSubmit={handleComplete}
        title="Complete Trip"
        label="Enter Final Odometer Reading (km)"
        placeholder="e.g., 15250"
        type="number"
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Cancel Trip"
        message="Are you sure you want to cancel this trip? This action cannot be undone."
        confirmText="Yes, Cancel Trip"
        cancelText="No, Keep Trip"
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

export default Trips;
