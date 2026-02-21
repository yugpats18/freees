import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const [fuelEfficiency, setFuelEfficiency] = useState([]);
  const [vehicleROI, setVehicleROI] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fuelRes, roiRes] = await Promise.all([
        analyticsAPI.getFuelEfficiency(),
        analyticsAPI.getVehicleROI()
      ]);
      setFuelEfficiency(fuelRes.data);
      setVehicleROI(roiRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await analyticsAPI.exportReport(type);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export report');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('vehicles')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Export Vehicles CSV
          </button>
          <button
            onClick={() => handleExport('trips')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Export Trips CSV
          </button>
          <button
            onClick={() => handleExport('expenses')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Export Expenses CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Fuel Efficiency (km/L)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fuelEfficiency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="license_plate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="fuel_efficiency" fill="#3B82F6" name="km/L" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Vehicle ROI (%)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicleROI}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="license_plate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="roi_percentage" fill="#10B981" name="ROI %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Fuel Efficiency Details</h2>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Vehicle</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">License Plate</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Total Fuel (L)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Odometer (km)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Efficiency (km/L)</th>
            </tr>
          </thead>
          <tbody>
            {fuelEfficiency.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">{item.model_name}</td>
                <td className="px-4 py-3 font-mono">{item.license_plate}</td>
                <td className="px-4 py-3">{parseFloat(item.total_fuel).toFixed(2)}</td>
                <td className="px-4 py-3">{parseFloat(item.odometer).toFixed(2)}</td>
                <td className="px-4 py-3 font-bold">{parseFloat(item.fuel_efficiency).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Vehicle ROI Analysis</h2>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Vehicle</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Revenue</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Fuel Cost</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Maintenance</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Net Profit</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">ROI %</th>
            </tr>
          </thead>
          <tbody>
            {vehicleROI.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">{item.model_name}</td>
                <td className="px-4 py-3">${parseFloat(item.total_revenue).toFixed(2)}</td>
                <td className="px-4 py-3">${parseFloat(item.fuel_cost).toFixed(2)}</td>
                <td className="px-4 py-3">${parseFloat(item.maintenance_cost).toFixed(2)}</td>
                <td className="px-4 py-3 font-bold">${parseFloat(item.net_profit).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${parseFloat(item.roi_percentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(item.roi_percentage).toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
