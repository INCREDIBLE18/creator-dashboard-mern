// models/ActivityLog.js  <- Make sure this is the file you are editing!

const mongoose = require('mongoose'); // <<< MUST import mongoose
const Schema = mongoose.Schema;

// Define the schema structure
const ActivityLogSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  actionType: {
    type: String,
    required: true,
    enum: [
        'LOGIN',
        'REGISTER',
        'SAVE_POST',
        'UNSAVE_POST',
        'REPORT_POST',
        'UPDATE_PROFILE',
        'COMPLETE_PROFILE'
    ]
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  details: { // Optional field for extra context
    postId: { type: String },
    source: { type: String },
    title: { type: String },
    pointsAwarded: { type: Number }
  }
});

// --- THIS IS THE CRUCIAL LINE ---
// Compile the schema into a model and export it
module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
// ---------------------------------