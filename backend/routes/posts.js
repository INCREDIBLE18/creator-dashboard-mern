// routes/posts.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

// Import Models
const SavedPost = require('../models/SavedPost');
const ReportedPost = require('../models/ReportedPost');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog'); // Import ActivityLog Model

// --- SAVE A POST ---
// @route   POST api/posts/save
// @desc    Save a post & award credits
// @access  Private
router.post(
  '/save',
  [
    authMiddleware,
    // Validators
    check('postId', 'Post ID is required').not().isEmpty(),
    check('source', 'Source is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('link', 'Link is required').isURL(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const userId = req.user.id;
    const { postId, source, title, link, author, contentSnippet } = req.body;
    try {
      let existingSave = await SavedPost.findOne({ user: userId, postId: postId });
      if (existingSave) return res.status(200).json({ msg: 'Post already saved', savedPost: existingSave });

      const newSavedPost = new SavedPost({ user: userId, postId, source, title, link, author: author || 'Unknown', contentSnippet: contentSnippet || '' });
      const savedPost = await newSavedPost.save();

      // Award Credits for Saving
      const SAVE_POST_CREDITS = 1;
      try {
          const updatedUser = await User.findByIdAndUpdate(userId, { $inc: { credits: SAVE_POST_CREDITS } }, { new: true });
          if (updatedUser) console.log(`Awarded ${SAVE_POST_CREDITS} credits to user ${userId} for saving post ${postId}. New total: ${updatedUser.credits}`);
          else console.error(`Could not find user ${userId} to award credits.`);
      } catch (creditError) { console.error(`Error awarding credits for saving post ${postId}:`, creditError.message); }

      // Log Save Activity
      // try {
      //     const activity = new ActivityLog({
      //         user: userId,
      //         actionType: 'SAVE_POST',
      //         details: { postId: savedPost.postId, source: savedPost.source, title: savedPost.title }
      //     });
      //     await activity.save();
      //     console.log(`Activity logged: SAVE_POST for user ${userId}, post ${savedPost.postId}`);
      // } catch (logErr) { console.error(`Failed to log SAVE_POST activity for user ${userId}:`, logErr.message); }

      res.status(201).json(savedPost);
    } catch (err) {
      console.error('Error saving post:', err.message);
      if (err.code === 11000) return res.status(400).json({ errors: [{ msg: 'Post already saved (concurrent request likely)' }] });
      res.status(500).send('Server Error');
    }
  }
);

// --- GET SAVED POSTS ---
// @route   GET api/posts/saved
// @desc    Get saved posts for user
// @access  Private
router.get(
  '/saved',
  authMiddleware,
  async (req, res) => {
    // --- Added Logs ---
    console.log(`--- ENTERED GET /api/posts/saved for user ${req.user.id} ---`);
    try {
      const userId = req.user.id;
      console.log(`Finding saved posts for user: ${userId}`);

      // Find documents matching the user ID, sort newest first
      const savedPosts = await SavedPost.find({ user: userId }).sort({ savedAt: -1 });

      console.log(`Found ${savedPosts.length} saved posts for user ${userId}. Sending response...`);
      res.json(savedPosts); // Send the array of posts
      console.log(`--- FINISHED GET /api/posts/saved for user ${userId} ---`);
      // ----------------

    } catch (err) {
      console.error(`!!! ERROR in GET /api/posts/saved for user ${req.user?.id}:`, err.message, err.stack);
      res.status(500).send('Server Error');
    }
  }
);

// --- REPORT A POST ---
// @route   POST api/posts/report
// @desc    Report a post & award credits
// @access  Private
router.post(
  '/report',
  [ authMiddleware, /* ...validators... */ ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const userId = req.user.id;
    const { postId, source, title, link, reason } = req.body;
    try {
      const newReport = new ReportedPost({ reportedBy: userId, postId, source, title, link, reason });
      await newReport.save();

      // Award Credits for Reporting
      const REPORT_POST_CREDITS = 2;
      try {
          const updatedUser = await User.findByIdAndUpdate( userId, { $inc: { credits: REPORT_POST_CREDITS } }, { new: true });
          if (updatedUser) console.log(`Awarded ${REPORT_POST_CREDITS} credits to user ${userId} for reporting post ${postId}. New total: ${updatedUser.credits}`);
          else console.error(`Could not find user ${userId} to award credits for report.`);
      } catch (creditError) { console.error(`Error awarding credits for reporting post ${postId}:`, creditError.message); }

      // Log Report Activity
       try {
          const activity = new ActivityLog({
              user: userId,
              actionType: 'REPORT_POST',
              details: { postId: newReport.postId, source: newReport.source, title: newReport.title }
          });
          await activity.save();
          console.log(`Activity logged: REPORT_POST for user ${userId}, post ${newReport.postId}`);
      } catch (logErr) { console.error(`Failed to log REPORT_POST activity for user ${userId}:`, logErr.message); }

      res.status(201).json({ msg: 'Post reported successfully', report: newReport });
    } catch (err) { console.error('Error reporting post:', err.message); res.status(500).send('Server Error'); }
  }
);


// --- UNSAVE A POST ---
// @route   DELETE api/posts/unsave/:postId
// @desc    Remove a post from the logged-in user's saved list
// @access  Private
router.delete(
  '/unsave/:postId',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const postIdToUnsave = req.params.postId;
      console.log(`Attempting to unsave post ${postIdToUnsave} for user ${userId}`);

      const result = await SavedPost.findOneAndDelete({ user: userId, postId: postIdToUnsave });

      if (!result) {
        console.log(`Post ${postIdToUnsave} not found in saved list for user ${userId}.`);
        return res.status(404).json({ msg: 'Post not found in your saved list' });
      }

      console.log(`Successfully unsaved post ${postIdToUnsave} for user ${userId}`);
      // Optional: Log unsave activity here?
      // try {
      //     const activity = new ActivityLog({ user: userId, actionType: 'UNSAVE_POST', details: { postId: postIdToUnsave }});
      //     await activity.save();
      //     console.log(`Activity logged: UNSAVE_POST for user ${userId}, post ${postIdToUnsave}`);
      // } catch (logErr) { console.error(`Failed to log UNSAVE_POST activity for user ${userId}:`, logErr.message); }

      res.json({ msg: 'Post unsaved successfully' });

    } catch (err) {
      console.error('Error unsaving post:', err.message);
      res.status(500).send('Server Error');
    }
  }
);


// Export the router
module.exports = router;