const pool = require('../config/database');

const getAllExpenses = async (req, res) => {
  try {
    const { vehicle_id, expense_type } = req.query;
    let query = `
      SELECT e.*, v.model_name, v.license_plate
      FROM expenses e
      LEFT JOIN vehicles v ON e.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (vehicle_id) {
      query += ` AND e.vehicle_id = $${paramCount}`;
      params.push(vehicle_id);
      paramCount++;
    }

    if (expense_type) {
      query += ` AND e.expense_type = $${paramCount}`;
      params.push(expense_type);
      paramCount++;
    }

    query += ' ORDER BY e.expense_date DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createExpense = async (req, res) => {
  try {
    const { vehicle_id, expense_type, fuel_liters, cost, expense_date, odometer_reading } = req.body;

    const result = await pool.query(
      `INSERT INTO expenses (vehicle_id, expense_type, fuel_liters, cost, expense_date, odometer_reading)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [vehicle_id, expense_type, fuel_liters, cost, expense_date, odometer_reading]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTotalOperationalCost = async (req, res) => {
  try {
    const { vehicle_id } = req.params;

    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(e.cost), 0) as fuel_cost,
        COALESCE((SELECT SUM(cost) FROM maintenance_logs WHERE vehicle_id = $1), 0) as maintenance_cost,
        COALESCE(SUM(e.cost), 0) + COALESCE((SELECT SUM(cost) FROM maintenance_logs WHERE vehicle_id = $1), 0) as total_cost
       FROM expenses e
       WHERE e.vehicle_id = $1`,
      [vehicle_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllExpenses, createExpense, getTotalOperationalCost };
