// models/SavedPost.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SavedPostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, // Link to the User model
    ref: 'User', // Reference the 'User' model (ensure your User model is exported as 'User')
    required: true,
    index: true, // Indexing user ID is good for lookup performance
  },
  // Store key identifiers for the saved post
  postId: { // The unique ID from the original source (e.g., reddit_t3_xyz, twitter_123)
    type: String,
    required: true,
  },
  source: { // e.g., 'Reddit', 'Twitter/X'
    type: String,
    required: true,
  },
  // Store some basic details for quick display (optional but useful)
  title: {
    type: String,
  },
  link: {
    type: String,
  },
  author: {
    type: String,
  },
  contentSnippet: {
      type: String,
  },
  // Timestamp for when it was saved
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index to prevent a user from saving the exact same post multiple times
SavedPostSchema.index({ user: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('SavedPost', SavedPostSchema);