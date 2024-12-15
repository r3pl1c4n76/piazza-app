// Import libraries
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

// Initialise app
const app = express();

// Middleware configuration
// Parse incoming JSON data to JS
app.use(bodyParser.json());

// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/piazza')
    .then(() => console.log('Connected to database'))
    .catch(err => console.log('Error connecting to database:', err));

// Route definition
// Welcome / landing page
app.get('/', (req, res) => {
    res.send('Welcome to the Piazza app!');
});
// Authentication
app.use('/api/auth', authRoutes);
// Posts
aopp.use('/api/posts', postRoutes);

// Start server
app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});
