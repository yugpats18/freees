import React, { useState, useEffect } from 'react';
import { expenseAPI, vehicleAPI } from '../services/api';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [totalCost, setTotalCost] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    expense_type: 'Fuel',
    fuel_liters: '',
    cost: '',
    expense_date: new Date().toISOString().split('T')[0],
    odometer_reading: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesRes, vehiclesRes] = await Promise.all([
        expenseAPI.getAll(),
        vehicleAPI.getAll()
      ]);
      setExpenses(expensesRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await expenseAPI.create(formData);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create expense');
    }
  };

  const handleViewTotal = async (vehicleId) => {
    try {
      const response = await expenseAPI.getTotalCost(vehicleId);
      setTotalCost(response.data);
      setSelectedVehicle(vehicleId);
    } catch (error) {
      alert('Failed to fetch total cost');
    }
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: '',
      expense_type: 'Fuel',
      fuel_liters: '',
      cost: '',
      expense_date: new Date().toISOString().split('T')[0],
      odometer_reading: ''
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Expense & Fuel Logging</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Expense
        </button>
      </div>

      {totalCost && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-3">Total Operational Cost</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Fuel Cost</p>
              <p className="text-2xl font-bold text-blue-600">${parseFloat(totalCost.fuel_cost).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Maintenance Cost</p>
              <p className="text-2xl font-bold text-yellow-600">${parseFloat(totalCost.maintenance_cost).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-red-600">${parseFloat(totalCost.total_cost).toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={() => setTotalCost(null)}
            className="mt-4 text-blue-600 hover:underline text-sm"
          >
            Close
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Vehicle</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Fuel (L)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Cost</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Odometer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(expense.expense_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{expense.license_plate}</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {expense.expense_type}
                  </span>
                </td>
                <td className="px-4 py-3">{expense.fuel_liters || '-'}</td>
                <td className="px-4 py-3 font-semibold">${parseFloat(expense.cost).toFixed(2)}</td>
                <td className="px-4 py-3">{expense.odometer_reading || '-'} km</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleViewTotal(expense.vehicle_id)}
                    className="text-blue-600 hover:underline"
                  >
                    View Total
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
            <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Vehicle</label>
                <select
                  required
                  className="w-full px-4 py-2 border rounded-lg"
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
                <label className="block text-sm font-semibold mb-2">Expense Type</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.expense_type}
                  onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                >
                  <option value="Fuel">Fuel</option>
                  <option value="Toll">Toll</option>
                  <option value="Parking">Parking</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {formData.expense_type === 'Fuel' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Fuel Liters</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.fuel_liters}
                    onChange={(e) => setFormData({ ...formData, fuel_liters: e.target.value })}
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Expense Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Odometer Reading (km)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.odometer_reading}
                  onChange={(e) => setFormData({ ...formData, odometer_reading: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Create
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

export default Expenses;
