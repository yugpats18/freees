# Fleet Management API Documentation

## Authentication

### POST /api/auth/login
Login with email and password
```json
{
  "email": "manager@fleet.com",
  "password": "password123"
}
```

### POST /api/auth/forgot-password
Request password reset
```json
{
  "email": "manager@fleet.com"
}
```

## Dashboard

### GET /api/dashboard/kpis
Get dashboard KPIs (requires authentication)

## Vehicles

### GET /api/vehicles
Get all vehicles (supports filters: type, status, region)

### POST /api/vehicles
Create vehicle (Fleet Manager only)

### PUT /api/vehicles/:id
Update vehicle (Fleet Manager only)

### PATCH /api/vehicles/:id/retire
Retire vehicle (Fleet Manager only)

### DELETE /api/vehicles/:id
Delete vehicle (Fleet Manager only)

## Trips

### GET /api/trips
Get all trips (supports filter: status)

### POST /api/trips
Create trip (Dispatcher, Fleet Manager)

### PATCH /api/trips/:id/dispatch
Dispatch trip (Dispatcher, Fleet Manager)

### PATCH /api/trips/:id/complete
Complete trip (Dispatcher, Fleet Manager)

### PATCH /api/trips/:id/cancel
Cancel trip (Dispatcher, Fleet Manager)

## Maintenance

### GET /api/maintenance
Get maintenance logs (supports filter: vehicle_id)

### POST /api/maintenance
Create maintenance log (Fleet Manager, Safety Officer)

### POST /api/maintenance/complete
Complete maintenance (Fleet Manager, Safety Officer)

## Expenses

### GET /api/expenses
Get expenses (supports filters: vehicle_id, expense_type)

### POST /api/expenses
Create expense (Financial Analyst, Fleet Manager)

### GET /api/expenses/vehicle/:vehicle_id/total
Get total operational cost for vehicle

## Drivers

### GET /api/drivers
Get all drivers (supports filter: status)

### POST /api/drivers
Create driver (Fleet Manager, Safety Officer)

### PUT /api/drivers/:id
Update driver (Fleet Manager, Safety Officer)

### GET /api/drivers/:id/performance
Get driver performance metrics

## Analytics

### GET /api/analytics/fuel-efficiency
Get fuel efficiency metrics

### GET /api/analytics/vehicle-roi
Get vehicle ROI analysis (Financial Analyst, Fleet Manager)

### GET /api/analytics/export/:type
Export report as CSV (types: vehicles, trips, expenses)
