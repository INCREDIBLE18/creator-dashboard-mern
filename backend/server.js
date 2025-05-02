// server.js
const express = require('express'); // Import Express
const connectDB = require('./config/db'); // Import DB connection function
const cors = require('cors'); // Import CORS
require('dotenv').config(); // Load .env variables



// Initialize Express App
const app = express();

// Connect to Database
connectDB();

// --- Middleware ---
// Enable CORS for all origins (allow frontend to connect)
app.use(cors());
// Enable Express to parse JSON request bodies
app.use(express.json({ extended: false }));

// --- Basic Route ---
// Define a simple route for testing if the server is running
app.get('/', (req, res) => res.send('Backend API is running...'));

// --- Define API Routes ---
// Tell Express to use the routes defined in './routes/auth.js'
// for any request that starts with '/api/auth'
app.use('/api/auth', require('./routes/auth'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/activity', require('./routes/activity'));
// Add other main route groups here later if needed
// e.g., app.use('/api/profile', require('./routes/profile'));
// e.g., app.use('/api/feed', require('./routes/feed'));


// --- Start the Server ---
// Get the port from environment variables or use 5000 as default
const PORT = process.env.PORT || 5000;

// Start listening on the specified port
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));