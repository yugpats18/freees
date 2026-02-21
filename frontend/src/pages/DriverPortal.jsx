import React, { useState, useEffect } from 'react';
import { tripAPI } from '../services/api';
import { getUser } from '../utils/auth';
import { FiMapPin, FiPackage, FiDollarSign, FiNavigation } from 'react-icons/fi';

const DriverPortal = () => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const user = getUser();

  useEffect(() => {
    fetchActiveTrip();
  }, []);

  const fetchActiveTrip = async () => {
    try {
      const response = await tripAPI.getDriverActiveTrip();
      setTrip(response.data);
    } catch (error) {
      console.error('Failed to fetch trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    const odometer = prompt('Enter final odometer reading (km):');
    if (!odometer) return;

    setCompleting(true);
    try {
      await tripAPI.complete(trip.id, { odometer_reading: parseFloat(odometer) });
      alert('Trip completed successfully! Your account will be deactivated. Thank you for your service.');
      window.location.href = '/login';
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to complete trip');
    } finally {
      setCompleting(false);
    }
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/${encodeURIComponent(trip.origin)}/${encodeURIComponent(trip.destination)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading your trip...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">No Active Trip</h2>
          <p className="text-gray-600">You don't have any active trips assigned.</p>
          <p className="text-sm text-gray-500 mt-4">Contact your dispatcher for more information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Driver Portal</h1>
              <p className="text-gray-600 mt-1">Welcome, {user?.full_name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Vehicle</p>
              <p className="text-xl font-bold text-blue-600">{trip.license_plate}</p>
            </div>
          </div>
        </div>

        {/* Trip Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Active Trip #{trip.id}</h2>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
              {trip.status}
            </span>
          </div>

          {/* Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiMapPin size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Origin</p>
                <p className="text-lg font-semibold">{trip.origin}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <FiMapPin size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="text-lg font-semibold">{trip.destination}</p>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FiPackage size={20} className="text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Cargo Weight</p>
                  <p className="text-xl font-bold">{trip.cargo_weight} kg</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FiNavigation size={20} className="text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-xl font-bold">{trip.distance || 'N/A'} km</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FiDollarSign size={20} className="text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Your Earnings</p>
                  <p className="text-xl font-bold text-green-600">${parseFloat(trip.driver_earnings || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Button */}
          <button
            onClick={openGoogleMaps}
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 mb-4"
          >
            <FiNavigation size={20} />
            <span className="text-lg font-semibold">Open Navigation (Google Maps)</span>
          </button>

          {/* Complete Trip Button */}
          {trip.status === 'Dispatched' && (
            <button
              onClick={handleCompleteTrip}
              disabled={completing}
              className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 text-lg font-semibold"
            >
              {completing ? 'Completing...' : 'Mark Trip as Complete'}
            </button>
          )}
        </div>

        {/* Trip Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Trip Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-semibold">Trip Created</p>
                <p className="text-sm text-gray-600">{new Date(trip.created_at).toLocaleString()}</p>
              </div>
            </div>
            {trip.dispatch_date && (
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-semibold">Dispatched</p>
                  <p className="text-sm text-gray-600">{new Date(trip.dispatch_date).toLocaleString()}</p>
                </div>
              </div>
            )}
            {trip.completion_date && (
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <div>
                  <p className="font-semibold">Completed</p>
                  <p className="text-sm text-gray-600">{new Date(trip.completion_date).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Your account will be automatically deactivated once you mark this trip as complete. 
            Make sure you've reached your destination before completing the trip.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverPortal;
