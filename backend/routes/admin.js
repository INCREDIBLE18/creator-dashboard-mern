// routes/admin.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator'); // Ensure validator functions are imported
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Import necessary models
const User = require('../models/User');
const ReportedPost = require('../models/ReportedPost');

// --- GET ALL USERS (Admin Only) ---
// @route   GET /api/admin/users
// @desc    Get a list of all users
// @access  Private (Admin Only)
router.get(
  '/users',
  [authMiddleware, adminMiddleware],
  async (req, res) => {
    try {
      const users = await User.find().select('-password').sort({ date: -1 });
      res.json(users);
    } catch (err) {
      console.error('Admin Get Users Error:', err.message);
      res.status(500).send('Server Error');
    }
  }
);

// --- GET ALL REPORTED POSTS (Admin Only) ---
// @route   GET /api/admin/reports
// @desc    Get a list of all reported posts
// @access  Private (Admin Only)
router.get(
    '/reports',
    [authMiddleware, adminMiddleware],
    async (req, res) => {
        try {
            const reports = await ReportedPost.find()
                .sort({ reportedAt: -1 })
                .populate('reportedBy', ['name', 'email']); // Get name/email of reporter
            res.json(reports);
        } catch (err) {
            console.error('Admin Get Reports Error:', err.message);
            res.status(500).send('Server Error');
        }
    }
);

// --- UPDATE USER CREDITS (Admin Only) ---
// @route   PUT /api/admin/users/:userId/credits
// @desc    Update a specific user's credit balance
// @access  Private (Admin Only)
router.put(
  '/users/:userId/credits',
  [
    authMiddleware,
    adminMiddleware,
    check('credits', 'Credits must be a non-negative integer').isInt({ min: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userIdToUpdate = req.params.userId;
    const newCreditValue = req.body.credits;
    if (newCreditValue === undefined) {
         return res.status(400).json({ errors: [{ msg: 'Credits value missing in request body'}] });
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        userIdToUpdate,
        { $set: { credits: parseInt(newCreditValue, 10) } },
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ msg: 'User not found' });
      }

      console.log(`Admin ${req.user.id} updated credits for user ${userIdToUpdate} to ${newCreditValue}`);
      res.json(updatedUser);

    } catch (err) {
      console.error('Admin Update Credits Error:', err.message);
      if (err.kind === 'ObjectId') {
          return res.status(400).json({ msg: 'Invalid User ID format' });
      }
      res.status(500).send('Server Error');
    }
  }
);


// --- UPDATE REPORT STATUS (Admin Only) --- <<< CODE BLOCK ADDED HERE
// @route   PUT /api/admin/reports/:reportId/status
// @desc    Update the status of a specific report
// @access  Private (Admin Only)
router.put(
  '/reports/:reportId/status', // Use reportId from URL parameter
  [
    authMiddleware,
    adminMiddleware, // Apply both middlewares
    // Validate the 'status' field in the request body
    check('status', 'Status must be one of: Reviewed, ActionTaken, Dismissed')
      .isIn(['Reviewed', 'ActionTaken', 'Dismissed'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get reportId from URL parameters
    const reportIdToUpdate = req.params.reportId;
    // Get the new status value from request body
    const { status: newStatus } = req.body;

    try {
      // Find the report by its MongoDB _id and update its status
      const updatedReport = await ReportedPost.findByIdAndUpdate(
        reportIdToUpdate,
        { $set: { status: newStatus } }, // Set the status field
        { new: true } // Return the updated document
      ).populate('reportedBy', ['name', 'email']); // Optionally re-populate

      if (!updatedReport) {
        return res.status(404).json({ msg: 'Report not found' });
      }

      console.log(`Admin ${req.user.id} updated status for report ${reportIdToUpdate} to ${newStatus}`);
      // Return the updated report document
      res.json(updatedReport);

    } catch (err) {
      console.error('Admin Update Report Status Error:', err.message);
      if (err.kind === 'ObjectId') {
          return res.status(400).json({ msg: 'Invalid Report ID format' });
      }
      res.status(500).send('Server Error');
    }
  }
);


// --- TODO LATER: ---
// DELETE /api/admin/users/:userId (Delete a user - use with caution!)

module.exports = router; // Make sure export is at the very end