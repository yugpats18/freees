const pool = require('../config/database');

const getAllDrivers = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM drivers WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = $1';
      params.push(status);
    }

    query += ' ORDER BY full_name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createDriver = async (req, res) => {
  try {
    const { full_name, license_number, license_expiry_date, phone } = req.body;

    const result = await pool.query(
      `INSERT INTO drivers (full_name, license_number, license_expiry_date, phone)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [full_name, license_number, license_expiry_date, phone]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, license_number, license_expiry_date, phone, safety_score, status } = req.body;

    const result = await pool.query(
      `UPDATE drivers SET full_name = $1, license_number = $2, license_expiry_date = $3, 
       phone = $4, safety_score = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [full_name, license_number, license_expiry_date, phone, safety_score, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDriverPerformance = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        d.*,
        COUNT(t.id) as total_trips,
        COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) as completed_trips,
        CASE 
          WHEN COUNT(t.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN t.status = 'Completed' THEN 1 END)::numeric / COUNT(t.id)::numeric) * 100, 2)
          ELSE 0 
        END as completion_rate
       FROM drivers d
       LEFT JOIN trips t ON d.id = t.driver_id
       WHERE d.id = $1
       GROUP BY d.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllDrivers, createDriver, updateDriver, getDriverPerformance };
