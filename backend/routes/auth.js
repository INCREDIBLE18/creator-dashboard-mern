// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
require('dotenv').config();

// Import Middleware
const authMiddleware = require('../middleware/authMiddleware');

// Import Models
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog'); // <-- Import ActivityLog Model

// --- REGISTRATION ROUTE ---
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [ // Validators
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      user = new User({ name, email, password });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      // Optional: Log registration activity?
      // try {
      //   const activity = new ActivityLog({ user: user.id, actionType: 'REGISTER' });
      //   await activity.save();
      //   console.log(`Activity logged: REGISTER for user ${user.id}`);
      // } catch (logErr) { console.error(`Failed to log REGISTER activity for user ${user.id}:`, logErr.message); }

      const payload = { user: { id: user.id, role: user.role } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
          if (err) throw err;
          res.status(201).json({ token });
        }
      );
    } catch (err) { console.error('Registration Error:', err.message); res.status(500).send('Server error'); }
  }
);


// --- LOGIN ROUTE ---
// @route   POST /api/auth/login
// @desc    Authenticate user, grant daily bonus, log activity & get token
// @access  Public
router.post(
  '/login',
  [ // Validators
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });

      // --- Daily Login Credit Logic ---
      const today = new Date(); today.setHours(0, 0, 0, 0);
      let grantDailyBonus = false;
      if (!user.lastLogin) { grantDailyBonus = true; console.log(`User ${user.email} first login, granting bonus.`); }
      else { const lastLoginDate = new Date(user.lastLogin); lastLoginDate.setHours(0, 0, 0, 0); if (today > lastLoginDate) { grantDailyBonus = true; console.log(`User ${user.email} logged in on new day, granting bonus.`); } else { console.log(`User ${user.email} already logged in today, no bonus.`); } }
      if (grantDailyBonus) { const DAILY_LOGIN_BONUS = 10; user.credits = (user.credits || 0) + DAILY_LOGIN_BONUS; console.log(`Awarded ${DAILY_LOGIN_BONUS} credits. New total: ${user.credits}`); }
      user.lastLogin = new Date();
      await user.save(); // Save user updates (credits and lastLogin)
      console.log(`User ${user.email} login processed. Last Login updated.`);
      // --- End Daily Login Credit Logic ---


      // --- Log Login Activity --- <<< CODE BLOCK ADDED HERE
      try {
          const activity = new ActivityLog({
              user: user.id,       // ID of the user who logged in
              actionType: 'LOGIN' // Type of action
              // 'details' field is optional here
          });
          await activity.save(); // Save the log document
          console.log(`Activity logged: LOGIN for user ${user.id}`);
      } catch (logErr) {
          console.error(`Failed to log LOGIN activity for user ${user.id}:`, logErr.message);
          // Continue with login even if logging fails
      }
      // ---------------------------


      // --- JWT Generation ---
      const payload = { user: { id: user.id, role: user.role } };
      jwt.sign( payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => { if (err) throw err; res.json({ token }); });
    } catch (err) { console.error('Login Error:', err.message); res.status(500).send('Server error'); }
  }
);


// --- GET LOGGED-IN USER ROUTE ---
// @route   GET /api/auth/user
// @desc    Get logged-in user data
// @access  Private
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) { console.error('Get User Error:', err.message); res.status(500).send('Server Error'); }
});


// Export the router
module.exports = router;