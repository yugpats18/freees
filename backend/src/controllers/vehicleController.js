const pool = require('../config/database');

const getAllVehicles = async (req, res) => {
  try {
    const { type, status, region } = req.query;
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (type) {
      query += ` AND vehicle_type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }
    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    if (region) {
      query += ` AND region = $${paramCount}`;
      params.push(region);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createVehicle = async (req, res) => {
  try {
    const { model_name, license_plate, vehicle_type, max_load_capacity, region, acquisition_cost } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicles (model_name, license_plate, vehicle_type, max_load_capacity, region, acquisition_cost, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Available') RETURNING *`,
      [model_name, license_plate, vehicle_type, max_load_capacity, region, acquisition_cost || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { model_name, license_plate, vehicle_type, max_load_capacity, odometer, region, status } = req.body;

    const result = await pool.query(
      `UPDATE vehicles SET model_name = $1, license_plate = $2, vehicle_type = $3, 
       max_load_capacity = $4, odometer = $5, region = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [model_name, license_plate, vehicle_type, max_load_capacity, odometer, region, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const retireVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE vehicles SET status = 'Retired', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllVehicles, createVehicle, updateVehicle, retireVehicle, deleteVehicle };
