const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if it's a driver login (license plate format without @)
    let query;
    let params;
    
    if (!email.includes('@')) {
      // Driver login - search by license plate username
      query = 'SELECT * FROM users WHERE email LIKE $1 AND role = $2';
      params = [`${email}%@driver.fleet`, 'driver'];
    } else {
      // Regular email login
      query = 'SELECT * FROM users WHERE email = $1';
      params = [email];
    }

    const result = await pool.query(query, params);
    
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

    // Send email with OTP
    try {
      await transporter.sendMail({
        from: `"Fleet Management System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset OTP - Fleet Management',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3B82F6;">Password Reset Request</h2>
            <p>You have requested to reset your password for Fleet Management System.</p>
            <div style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">Your OTP is:</p>
              <h1 style="margin: 10px 0; color: #3B82F6; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
            </div>
            <p style="color: #666;">This OTP is valid for <strong>10 minutes</strong>.</p>
            <p style="color: #666;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Fleet Management System</p>
          </div>
        `
      });

      console.log(`OTP sent to ${email}: ${otp}`); // Keep for development
      
      res.json({ 
        message: 'OTP sent to your email',
        // Remove otp from response in production
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Still return OTP in development if email fails
      if (process.env.NODE_ENV === 'development') {
        res.json({ 
          message: 'Email failed but OTP generated (dev mode)',
          otp: otp
        });
      } else {
        throw new Error('Failed to send email');
      }
    }
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
