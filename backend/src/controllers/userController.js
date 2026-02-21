const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, true) RETURNING id, email, full_name, role`,
      [email, hashedPassword, full_name, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllUsers, createUser, deleteUser };
