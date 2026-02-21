-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst', 'driver')),
  driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  model_name VARCHAR(255) NOT NULL,
  license_plate VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('Truck', 'Van', 'Bike')),
  max_load_capacity DECIMAL(10, 2) NOT NULL,
  odometer DECIMAL(10, 2) DEFAULT 0,
  acquisition_cost DECIMAL(12, 2) DEFAULT 0,
  region VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'On Trip', 'In Shop', 'Retired')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  license_expiry_date DATE NOT NULL,
  phone VARCHAR(20),
  safety_score DECIMAL(5, 2) DEFAULT 100.00,
  trip_completion_rate DECIMAL(5, 2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'Off Duty' CHECK (status IN ('On Duty', 'Off Duty', 'Suspended')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
  driver_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  cargo_weight DECIMAL(10, 2) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  distance DECIMAL(10, 2),
  revenue DECIMAL(12, 2) DEFAULT 0,
  driver_earnings DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')),
  dispatch_date TIMESTAMP,
  completion_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Logs Table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  service_type VARCHAR(100) NOT NULL CHECK (service_type IN ('Oil Change', 'Repair', 'Inspection', 'Other')),
  description TEXT,
  cost DECIMAL(10, 2) NOT NULL,
  service_date DATE NOT NULL,
  odometer_reading DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses Table (Fuel Logging)
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
  expense_type VARCHAR(50) DEFAULT 'Fuel' CHECK (expense_type IN ('Fuel', 'Toll', 'Parking', 'Other')),
  fuel_liters DECIMAL(10, 2),
  cost DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  odometer_reading DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);
CREATE INDEX idx_drivers_status ON drivers(status);
