// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Access JWT_SECRET from .env

module.exports = function (req, res, next) {
  // --- ADD THESE LOGS ---
  console.log(`\n--- Auth Middleware Triggered for: ${req.method} ${req.originalUrl} ---`); // Log which route is being checked
  console.log('Incoming Headers:', req.headers); // Log all headers received by the server
  // --------------------

  // 1. Get token from request header
  const token = req.header('x-auth-token');

  // --- ADD LOG TO SHOW TOKEN FOUND ---
  // Log the token found (or undefined if missing). Shows first 10 chars for brevity if found.
  console.log('Token extracted from "x-auth-token" header:', token ? `"${token.substring(0, 10)}..."` : token);
  // -----------------------------------

  // 2. Check if token doesn't exist
  if (!token) {
    console.log('Middleware check FAILED: No token found in header.'); // Add log
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token if it exists
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    console.log('Middleware check PASSED. User ID:', req.user.id); // Add log for success
    next(); // Proceed to the actual route handler
  } catch (err) {
    console.error('Token verification failed:', err.message); // Keep existing error log
    console.log('Middleware check FAILED: Token is not valid.'); // Add log
    res.status(401).json({ msg: 'Token is not valid' });
  }
};