// routes/activity.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const ActivityLog = require('../models/ActivityLog');

// --- GET RECENT ACTIVITY FOR CURRENT USER ---
// @route   GET api/activity/me
// @desc    Get recent activity logs for the logged-in user
// @access  Private
router.get(
  '/me',
  authMiddleware,
  async (req, res) => {
    console.log(`--- ENTERED GET /api/activity/me for user ${req.user.id} ---`);
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit, 10) || 15; // Default limit 15

      console.log(`Finding recent activity for user: ${userId} (limit: ${limit})`);

      const activities = await ActivityLog.find({ user: userId })
        .sort({ timestamp: -1 })
        .limit(limit);

      console.log(`Found ${activities.length} activity logs for user ${userId}.`);
      res.json(activities);

    } catch (err) {
      console.error(`!!! ERROR in GET /api/activity/me for user ${req.user?.id}:`, err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;