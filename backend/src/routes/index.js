const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const authController = require('../controllers/authController');
const vehicleController = require('../controllers/vehicleController');
const tripController = require('../controllers/tripController');
const maintenanceController = require('../controllers/maintenanceController');
const expenseController = require('../controllers/expenseController');
const driverController = require('../controllers/driverController');
const analyticsController = require('../controllers/analyticsController');
const userController = require('../controllers/userController');

// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/reset-password', authController.resetPassword);

// User management routes (Fleet Manager only)
router.get('/users', authenticate, authorize('fleet_manager'), userController.getAllUsers);
router.post('/users', authenticate, authorize('fleet_manager'), userController.createUser);
router.delete('/users/:id', authenticate, authorize('fleet_manager'), userController.deleteUser);

// Dashboard routes
router.get('/dashboard/kpis', authenticate, analyticsController.getDashboardKPIs);

// Vehicle routes
router.get('/vehicles', authenticate, vehicleController.getAllVehicles);
router.post('/vehicles', authenticate, authorize('fleet_manager'), vehicleController.createVehicle);
router.put('/vehicles/:id', authenticate, authorize('fleet_manager'), vehicleController.updateVehicle);
router.patch('/vehicles/:id/retire', authenticate, authorize('fleet_manager'), vehicleController.retireVehicle);
router.delete('/vehicles/:id', authenticate, authorize('fleet_manager'), vehicleController.deleteVehicle);

// Trip routes
router.get('/trips', authenticate, tripController.getAllTrips);
router.post('/trips', authenticate, authorize('dispatcher', 'fleet_manager'), tripController.createTrip);
router.patch('/trips/:id/dispatch', authenticate, authorize('dispatcher', 'fleet_manager'), tripController.dispatchTrip);
router.patch('/trips/:id/complete', authenticate, tripController.completeTrip);
router.patch('/trips/:id/cancel', authenticate, authorize('dispatcher', 'fleet_manager'), tripController.cancelTrip);
router.get('/trips/driver/active', authenticate, authorize('driver'), tripController.getDriverActiveTrip);

// Maintenance routes
router.get('/maintenance', authenticate, maintenanceController.getAllMaintenance);
router.post('/maintenance', authenticate, authorize('fleet_manager', 'safety_officer'), maintenanceController.createMaintenance);
router.post('/maintenance/complete', authenticate, authorize('fleet_manager', 'safety_officer'), maintenanceController.completeMaintenance);

// Expense routes
router.get('/expenses', authenticate, expenseController.getAllExpenses);
router.post('/expenses', authenticate, authorize('financial_analyst', 'fleet_manager'), expenseController.createExpense);
router.get('/expenses/vehicle/:vehicle_id/total', authenticate, expenseController.getTotalOperationalCost);

// Driver routes
router.get('/drivers', authenticate, driverController.getAllDrivers);
router.post('/drivers', authenticate, authorize('fleet_manager', 'safety_officer'), driverController.createDriver);
router.put('/drivers/:id', authenticate, authorize('fleet_manager', 'safety_officer'), driverController.updateDriver);
router.get('/drivers/:id/performance', authenticate, driverController.getDriverPerformance);

// Analytics routes
router.get('/analytics/fuel-efficiency', authenticate, analyticsController.getFuelEfficiency);
router.get('/analytics/vehicle-roi', authenticate, authorize('financial_analyst', 'fleet_manager'), analyticsController.getVehicleROI);
router.get('/analytics/export/:type', authenticate, analyticsController.exportReport);

module.exports = router;
