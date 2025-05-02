// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Optional: Alias for mongoose.Schema for brevity

// Define the structure of the User document
const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'], // Make name mandatory
  },
  email: {
    type: String,
    required: [true, 'Email is required'], // Make email mandatory
    unique: true, // Ensure no two users can register with the same email
    lowercase: true, // Store email in lowercase for consistency
    trim: true, // Remove leading/trailing whitespace
  },
  password: {
    type: String,
    required: [true, 'Password is required'], // Make password mandatory
    minlength: [6, 'Password must be at least 6 characters long'], // Basic length validation
  },
  role: {
    type: String,
    enum: ['User', 'Admin'], // Define the allowed roles
    default: 'User',        // Set the default role when a user registers
  },
  credits: {
    type: Number,
    default: 0, // New users start with 0 credits
  },

  lastLogin: {
    type: Date,
    default: null, // Default to null for new users
  },

  bio: {
    type: String,
    maxlength: 500, // Optional: limit bio length
    default: ''     // Default to empty string
  },
  profileCompleted: { // Flag to track if completion bonus awarded
      type: Boolean,
      default: false
  },
  
  date: {
    type: Date,
    default: Date.now, // Record the date when the user document was created
  },
  // You can add more fields here later for profile information if needed
  // e.g., bio: String, avatar: String, etc.
});

// Create and export the User model
// Mongoose will automatically look for the plural, lowercased version
// of your model name for the collection ('User' -> 'users' collection)
module.exports = mongoose.model('User', UserSchema);