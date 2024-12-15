// Import libraries
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');

// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/piazza')
    .then(() => console.log('Connected to database'))
    .catch(err => console.log('Error connecting to database:', err));

// Create routes
// Welcome / landing page
app.get('/', (req, res) => {
    res.send('Welcome to the Piazza app!');
});

// Middleware
// Parse incoming JSON data to JS
app.use(bodyParser.json());

// Authentication
app.use('/api/auth', authRoutes);

// Start server
app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});
