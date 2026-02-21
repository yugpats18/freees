const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const crypto = require('crypto');

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP with 10-minute expiry
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // In production, send email here using nodemailer or similar
    // For now, return OTP in response (ONLY FOR DEVELOPMENT)
    console.log(`OTP for ${email}: ${otp}`);
    
    res.json({ 
      message: 'OTP sent to email',
      // Remove this in production:
      otp: otp // ONLY FOR DEVELOPMENT - Remove in production!
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const stored = otpStore.get(email);
    
    if (!stored) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }
    
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP expired' });
    }
    
    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    
    const stored = otpStore.get(email);
    
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
      [hashedPassword, email]
    );
    
    // Clear OTP
    otpStore.delete(email);
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login, forgotPassword, verifyOTP, resetPassword };
