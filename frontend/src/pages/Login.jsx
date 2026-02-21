import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { setAuth } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      
      if (response.data.token && response.data.user) {
        setAuth(response.data.token, response.data.user);
        
        if (response.data.user.role === 'driver') {
          navigate('/driver');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary to-accent">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-primary">FleetFlow</h1>
        <p className="text-center text-gray-600 mb-8">Fleet & Logistics Management</p>

        {error && (
          <div className="bg-red-50 border border-secondary text-secondary px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email or License Plate
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com or ABC1234"
            />
            <p className="text-xs text-gray-500 mt-1">
              Drivers: Enter license plate only (no @ needed)
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all font-semibold disabled:bg-gray-400 shadow-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="w-full mt-3 text-secondary hover:underline text-sm font-semibold"
          >
            Forgot Password?
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
