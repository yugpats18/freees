const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const seedData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Seed users
    const hashedPassword = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (email, password, full_name, role) VALUES
      ('manager@fleet.com', $1, 'John Manager', 'fleet_manager'),
      ('dispatcher@fleet.com', $1, 'Sarah Dispatcher', 'dispatcher'),
      ('safety@fleet.com', $1, 'Mike Safety', 'safety_officer'),
      ('finance@fleet.com', $1, 'Emma Finance', 'financial_analyst')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    // Seed vehicles
    await client.query(`
      INSERT INTO vehicles (model_name, license_plate, vehicle_type, max_load_capacity, region, acquisition_cost, odometer) VALUES
      ('Ford F-150', 'ABC-1234', 'Truck', 2000, 'North', 45000, 15000),
      ('Mercedes Sprinter', 'XYZ-5678', 'Van', 1500, 'South', 38000, 22000),
      ('Honda CB500', 'MNO-9012', 'Bike', 50, 'East', 8000, 5000),
      ('Volvo FH16', 'DEF-3456', 'Truck', 3000, 'West', 85000, 45000),
      ('Toyota Hiace', 'GHI-7890', 'Van', 1200, 'North', 32000, 18000)
      ON CONFLICT (license_plate) DO NOTHING
    `);

    // Seed drivers
    await client.query(`
      INSERT INTO drivers (full_name, license_number, license_expiry_date, phone, safety_score) VALUES
      ('James Wilson', 'DL-001-2024', '2026-12-31', '+1234567890', 95.5),
      ('Maria Garcia', 'DL-002-2024', '2027-06-30', '+1234567891', 98.2),
      ('Robert Chen', 'DL-003-2024', '2026-09-15', '+1234567892', 92.8),
      ('Lisa Anderson', 'DL-004-2024', '2027-03-20', '+1234567893', 96.7)
      ON CONFLICT (license_number) DO NOTHING
    `);

    // Seed trips
    await client.query(`
      INSERT INTO trips (vehicle_id, driver_id, cargo_weight, origin, destination, distance, revenue, status) VALUES
      (1, 1, 1800, 'New York', 'Boston', 350, 1200, 'Completed'),
      (2, 2, 1200, 'Los Angeles', 'San Diego', 180, 800, 'Dispatched'),
      (3, 3, 40, 'Chicago', 'Milwaukee', 120, 150, 'Draft')
    `);

    // Seed expenses
    await client.query(`
      INSERT INTO expenses (vehicle_id, expense_type, fuel_liters, cost, expense_date, odometer_reading) VALUES
      (1, 'Fuel', 80, 240, '2026-02-15', 14800),
      (2, 'Fuel', 65, 195, '2026-02-16', 21800),
      (4, 'Fuel', 120, 360, '2026-02-17', 44800)
    `);

    // Seed maintenance logs
    await client.query(`
      INSERT INTO maintenance_logs (vehicle_id, service_type, description, cost, service_date, odometer_reading) VALUES
      (1, 'Oil Change', 'Regular oil change and filter replacement', 150, '2026-02-10', 14500),
      (4, 'Repair', 'Brake pad replacement', 450, '2026-02-12', 44500)
    `);

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
};

seedData();
