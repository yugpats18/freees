import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, new_password: newPassword }),
};

export const dashboardAPI = {
  getKPIs: () => api.get('/dashboard/kpis'),
};

export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  retire: (id) => api.patch(`/vehicles/${id}/retire`),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const tripAPI = {
  getAll: (params) => api.get('/trips', { params }),
  create: (data) => api.post('/trips', data),
  dispatch: (id) => api.patch(`/trips/${id}/dispatch`),
  complete: (id, data) => api.patch(`/trips/${id}/complete`, data),
  cancel: (id) => api.patch(`/trips/${id}/cancel`),
  getDriverActiveTrip: () => api.get('/trips/driver/active'),
};

export const maintenanceAPI = {
  getAll: (params) => api.get('/maintenance', { params }),
  create: (data) => api.post('/maintenance', data),
  complete: (vehicleId) => api.post('/maintenance/complete', { vehicle_id: vehicleId }),
};

export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  getTotalCost: (vehicleId) => api.get(`/expenses/vehicle/${vehicleId}/total`),
};

export const driverAPI = {
  getAll: (params) => api.get('/drivers', { params }),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  getPerformance: (id) => api.get(`/drivers/${id}/performance`),
};

export const analyticsAPI = {
  getFuelEfficiency: (params) => api.get('/analytics/fuel-efficiency', { params }),
  getVehicleROI: () => api.get('/analytics/vehicle-roi'),
  exportReport: (type) => api.get(`/analytics/export/${type}`, { responseType: 'blob' }),
};

export default api;


export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  delete: (id) => api.delete(`/users/${id}`),
};
