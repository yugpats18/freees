const pool = require('../config/database');

const getAllMaintenance = async (req, res) => {
  try {
    const { vehicle_id } = req.query;
    let query = `
      SELECT m.*, v.model_name, v.license_plate
      FROM maintenance_logs m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (vehicle_id) {
      query += ' AND m.vehicle_id = $1';
      params.push(vehicle_id);
    }

    query += ' ORDER BY m.service_date DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMaintenance = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { vehicle_id, service_type, description, cost, service_date, odometer_reading } = req.body;

    // Create maintenance log
    const result = await client.query(
      `INSERT INTO maintenance_logs (vehicle_id, service_type, description, cost, service_date, odometer_reading)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [vehicle_id, service_type, description, cost, service_date, odometer_reading]
    );

    // Update vehicle status to In Shop
    await client.query(`UPDATE vehicles SET status = 'In Shop' WHERE id = $1`, [vehicle_id]);

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

const completeMaintenance = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { vehicle_id } = req.body;

    // Update vehicle status back to Available
    await client.query(`UPDATE vehicles SET status = 'Available' WHERE id = $1`, [vehicle_id]);

    await client.query('COMMIT');
    res.json({ message: 'Vehicle returned to service' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

module.exports = { getAllMaintenance, createMaintenance, completeMaintenance };
