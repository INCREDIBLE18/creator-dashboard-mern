// models/ReportedPost.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportedPostSchema = new Schema({
  reportedBy: { // User who reported it
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Details of the post being reported
  postId: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  link: {
    type: String,
  },
  // Report details
  reason: { // Optional reason provided by user
    type: String,
    maxlength: 500
  },
  status: { // For potential admin review later
    type: String,
    enum: ['Pending', 'Reviewed', 'ActionTaken', 'Dismissed'],
    default: 'Pending',
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Index for efficient querying by status or reporter
ReportedPostSchema.index({ status: 1 });
ReportedPostSchema.index({ reportedBy: 1 });
// Prevent same user reporting same post multiple times? Maybe not necessary initially.
// ReportedPostSchema.index({ reportedBy: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('ReportedPost', ReportedPostSchema);