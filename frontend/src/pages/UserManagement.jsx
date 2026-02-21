import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'dispatcher'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userAPI.create(formData);
      setShowModal(false);
      resetForm();
      fetchUsers();
      alert('User account created successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(id);
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'dispatcher'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'fleet_manager':
        return 'bg-purple-100 text-purple-800';
      case 'dispatcher':
        return 'bg-blue-100 text-blue-800';
      case 'safety_officer':
        return 'bg-green-100 text-green-800';
      case 'financial_analyst':
        return 'bg-yellow-100 text-yellow-800';
      case 'driver':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Create New Account
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role !== 'driver').map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{user.full_name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                    {user.role.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
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
            <h2 className="text-2xl font-bold mb-4">Create New Account</h2>
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
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Role</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="dispatcher">Dispatcher</option>
                  <option value="fleet_manager">Fleet Manager</option>
                  <option value="safety_officer">Safety Officer</option>
                  <option value="financial_analyst">Financial Analyst</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
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

export default UserManagement;
