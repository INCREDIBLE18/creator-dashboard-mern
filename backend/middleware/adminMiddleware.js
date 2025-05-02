// middleware/adminMiddleware.js
// This middleware assumes authMiddleware has already run and attached req.user

module.exports = function (req, res, next) {
    // Check if user is logged in (should be guaranteed by authMiddleware running first)
    // and if the user role is 'Admin'
    if (!req.user || req.user.role !== 'Admin') {
      console.log(`Admin access denied for user: ${req.user ? req.user.id + ' (' + req.user.role + ')' : 'No user found'}`);
      // 403 Forbidden - Client understands the request but refuses to authorize it
      return res.status(403).json({ msg: 'Admin authorization denied' });
    }
  
    // If user exists and role is Admin, proceed to the next middleware/route handler
    console.log(`Admin access GRANTED for user: ${req.user.id}`);
    next();
  };