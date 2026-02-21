const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const getAllTrips = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT t.*, v.model_name, v.license_plate, d.full_name as driver_name
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND t.status = $1';
      params.push(status);
    }

    query += ' ORDER BY t.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTrip = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { vehicle_id, driver_id, cargo_weight, origin, destination, distance, revenue, driver_earnings } = req.body;

    // Validate vehicle capacity
    const vehicleResult = await client.query('SELECT max_load_capacity, status FROM vehicles WHERE id = $1', [vehicle_id]);
    if (vehicleResult.rows.length === 0) {
      throw new Error('Vehicle not found');
    }

    const vehicle = vehicleResult.rows[0];
    if (cargo_weight > vehicle.max_load_capacity) {
      throw new Error(`Cargo weight exceeds vehicle capacity (${vehicle.max_load_capacity} kg)`);
    }

    if (vehicle.status !== 'Available') {
      throw new Error('Vehicle is not available');
    }

    // Validate driver license
    const driverResult = await client.query('SELECT license_expiry_date, status FROM drivers WHERE id = $1', [driver_id]);
    if (driverResult.rows.length === 0) {
      throw new Error('Driver not found');
    }

    const driver = driverResult.rows[0];
    if (new Date(driver.license_expiry_date) < new Date()) {
      throw new Error('Driver license has expired');
    }

    if (driver.status === 'Suspended') {
      throw new Error('Driver is suspended');
    }

    // Create trip
    const tripResult = await client.query(
      `INSERT INTO trips (vehicle_id, driver_id, cargo_weight, origin, destination, distance, revenue, driver_earnings, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Draft') RETURNING *`,
      [vehicle_id, driver_id, cargo_weight, origin, destination, distance, revenue || 0, driver_earnings || 0]
    );

    await client.query('COMMIT');
    res.status(201).json(tripResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

const dispatchTrip = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Get trip details
    const tripResult = await client.query(
      `SELECT t.*, v.license_plate, d.full_name as driver_name, d.phone as driver_phone
       FROM trips t
       JOIN vehicles v ON t.vehicle_id = v.id
       JOIN drivers d ON t.driver_id = d.id
       WHERE t.id = $1 AND t.status = 'Draft'`,
      [id]
    );

    if (tripResult.rows.length === 0) {
      throw new Error('Trip not found or already dispatched');
    }

    const trip = tripResult.rows[0];

    // Generate unique driver account credentials
    const timestamp = Date.now();
    const username = `${trip.license_plate.replace(/[^a-zA-Z0-9]/g, '')}_${timestamp}`; // Unique username
    const password = Math.random().toString(36).slice(-8); // Generate 8-char password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create NEW driver user account (always create new, never reuse)
    const userResult = await client.query(
      `INSERT INTO users (email, password, full_name, role, driver_id, is_active)
       VALUES ($1, $2, $3, 'driver', $4, true)
       RETURNING id`,
      [`${username}@driver.fleet`, hashedPassword, trip.driver_name, trip.driver_id]
    );

    const driverUserId = userResult.rows[0].id;

    // Update trip with driver user and dispatch
    await client.query(
      `UPDATE trips SET status = 'Dispatched', driver_user_id = $1, dispatch_date = CURRENT_TIMESTAMP, 
       updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [driverUserId, id]
    );

    // Update vehicle and driver status
    await client.query(`UPDATE vehicles SET status = 'On Trip' WHERE id = $1`, [trip.vehicle_id]);
    await client.query(`UPDATE drivers SET status = 'On Duty' WHERE id = $1`, [trip.driver_id]);

    await client.query('COMMIT');
    
    res.json({
      trip: tripResult.rows[0],
      driverCredentials: {
        username: username,
        password: password,
        message: 'Share these credentials with the driver. They will be deactivated after trip completion.'
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

const completeTrip = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { odometer_reading } = req.body;

    // Get trip and vehicle details
    const tripResult = await client.query(
      `SELECT t.*, v.odometer as current_odometer, v.id as vehicle_id
       FROM trips t
       JOIN vehicles v ON t.vehicle_id = v.id
       WHERE t.id = $1 AND t.status = 'Dispatched'`,
      [id]
    );

    if (tripResult.rows.length === 0) {
      throw new Error('Trip not found or not dispatched');
    }

    const trip = tripResult.rows[0];
    const currentOdometer = parseFloat(trip.current_odometer);
    const newOdometer = parseFloat(odometer_reading);

    // Validate odometer reading
    if (newOdometer <= currentOdometer) {
      throw new Error(`Odometer reading must be greater than current reading (${currentOdometer} km)`);
    }

    // Optional: Validate against trip distance (if distance is set)
    if (trip.distance) {
      const expectedMinOdometer = currentOdometer + parseFloat(trip.distance) * 0.8; // Allow 20% variance
      const expectedMaxOdometer = currentOdometer + parseFloat(trip.distance) * 1.5; // Allow 50% extra
      
      if (newOdometer < expectedMinOdometer || newOdometer > expectedMaxOdometer) {
        throw new Error(`Odometer reading (${newOdometer} km) seems incorrect for trip distance (${trip.distance} km). Expected range: ${expectedMinOdometer.toFixed(0)}-${expectedMaxOdometer.toFixed(0)} km`);
      }
    }

    // Update trip status
    await client.query(
      `UPDATE trips SET status = 'Completed', completion_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    // Deactivate driver account
    if (trip.driver_user_id) {
      await client.query(`UPDATE users SET is_active = false WHERE id = $1`, [trip.driver_user_id]);
    }

    // Update vehicle status and odometer
    await client.query(
      `UPDATE vehicles SET status = 'Available', odometer = $1 WHERE id = $2`,
      [newOdometer, trip.vehicle_id]
    );

    // Update driver status
    await client.query(`UPDATE drivers SET status = 'Off Duty' WHERE id = $1`, [trip.driver_id]);

    await client.query('COMMIT');
    res.json({ message: 'Trip completed successfully', odometer: newOdometer });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

const cancelTrip = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    const tripResult = await client.query(
      `UPDATE trips SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );

    if (tripResult.rows.length === 0) {
      throw new Error('Trip not found');
    }

    const trip = tripResult.rows[0];

    // Reset vehicle and driver status if trip was dispatched
    if (trip.status === 'Dispatched') {
      await client.query(`UPDATE vehicles SET status = 'Available' WHERE id = $1`, [trip.vehicle_id]);
      await client.query(`UPDATE drivers SET status = 'Off Duty' WHERE id = $1`, [trip.driver_id]);
    }

    await client.query('COMMIT');
    res.json(tripResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

const getDriverActiveTrip = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT t.*, v.model_name, v.license_plate, d.full_name as driver_name
       FROM trips t
       LEFT JOIN vehicles v ON t.vehicle_id = v.id
       LEFT JOIN drivers d ON t.driver_id = d.id
       WHERE t.driver_user_id = $1 AND t.status = 'Dispatched'
       ORDER BY t.dispatch_date DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllTrips, createTrip, dispatchTrip, completeTrip, cancelTrip, getDriverActiveTrip };
