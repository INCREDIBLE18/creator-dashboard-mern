// routes/profile.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog'); // 1. Import ActivityLog

// --- GET CURRENT USER'S PROFILE ---
// (No changes needed here)
router.get('/me', authMiddleware, async (req, res) => { /* ... existing code ... */ });


// --- UPDATE USER PROFILE ---
router.put('/', [ authMiddleware, /* ...validators... */ ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, bio } = req.body;
    const userId = req.user.id;
    const profileFields = {};
    if (name !== undefined) profileFields.name = name;
    if (bio !== undefined) profileFields.bio = bio;

    try {
      let user = await User.findById(userId);
      if (!user) return res.status(404).json({ msg: 'User not found' });

      let awardedCompletionBonus = 0;
      // Award Profile Completion Credits Logic
      if (bio && !user.profileCompleted) {
         const PROFILE_COMPLETE_BONUS = 25;
         profileFields.credits = (user.credits || 0) + PROFILE_COMPLETE_BONUS;
         profileFields.profileCompleted = true;
         awardedCompletionBonus = PROFILE_COMPLETE_BONUS;
         console.log(`Awarding ${PROFILE_COMPLETE_BONUS} profile completion bonus to user ${userId}.`);
      }

      // Update user document
      user = await User.findByIdAndUpdate(
        userId, { $set: profileFields }, { new: true }
      ).select('-password');

      // --- 2. Log Profile Update Activity ---
    //   try {
    //       // Log the basic profile update first
    //       const updateActivity = new ActivityLog({ user: userId, actionType: 'UPDATE_PROFILE' });
    //       await updateActivity.save();
    //       console.log(`Activity logged: UPDATE_PROFILE for user ${userId}`);

    //       // If bonus was awarded, log that specifically too
    //       if (awardedCompletionBonus > 0) {
    //           const bonusActivity = new ActivityLog({
    //               user: userId,
    //               actionType: 'COMPLETE_PROFILE',
    //               details: { pointsAwarded: awardedCompletionBonus }
    //           });
    //           await bonusActivity.save();
    //           console.log(`Activity logged: COMPLETE_PROFILE for user ${userId}`);
    //       }
    //   } catch (logErr) {
    //       console.error(`Failed to log profile update activity for user ${userId}:`, logErr.message);
    //   }
      // -------------------------------------

      res.json({ user, bonusAwarded: awardedCompletionBonus });

    } catch (err) { /* ... error handling ... */ }
});


module.exports = router;