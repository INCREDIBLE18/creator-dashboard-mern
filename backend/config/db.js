// config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Make .env variables available

const connectDB = async () => {
  try {
    // Use the MONGO_URI from your .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully!'); // Success message
  } catch (err) {
    console.error('MongoDB Connection Failed:', err.message);
    // Exit process with failure code if connection fails
    process.exit(1);
  }
};

module.exports = connectDB; // Export the function