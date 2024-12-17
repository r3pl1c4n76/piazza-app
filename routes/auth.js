// Import libraries
const express = require ('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');

// Create router object to define routes
const router = express.Router();

// Import User model to interact with MongoDB
const User = require('../models/User');

// Registration endpoint
router.post(
    '/register',
    [
        //Validate user input for username, email and password
        check('username', 'Username is required').exists(),
        check('email', 'A valid email address is required').isEmail(),
        check('password', 'Your password must be at least 6 characters').isLength({min: 6})
    ],

    // Validate registration input
    async (req, res) => {
        const errors = validationResult(req);
        // Report input errors if present
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        // Extract username and password from request
        const {username, email, password} = req.body;

        // Create new User record
        try {
            // Create hashed user password
            const hashedPassword = await bcrypt.hash(password, 10);
            // Create new User record with hashed password
            const user = new User({username, email, password: hashedPassword})
            // Save new User to database
            await user.save();
            // Confirm successful save of new user
            res.status(201).json({message: 'User registered successfully'});
        }

        // Report unsucessful save or error creating new User record
        catch (error) {
            res.status(500).json({error: 'Error registering user'});
        }
    }
);

// Login endpoint
router.post(
    '/login',
    [
        // Validate input for username and password
        check('username', 'Username is required').exists(),
        check('password', 'Password is required').exists()
    ],
    // Validate login credentials
    async (req, res) => {
        const errors = validationResult(req);
        // Report input errors if present
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        // Extract username and password from request
        const {username, password} = req.body;

        // Check database for combined username and password
        try {
            // Check database for presence of username
            const user = await User.findOne({username});
            // Report if username is not present
            if (!user) {
                return res.status(400).json({error: 'Invalid username'});
            }
            // If username present, check password matches stored hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            // Report if password does not match
            if (!isMatch) {
                return res.status(400).json({error: 'Invalid password'});
            }
        
        // If username and pasword validated, generate JWT token with user ID
        const token = jwt.sign({id: user._id, username: user.username}, 'your_jwt_secret', {expiresIn: '1h'});
        // Return JWT token
        res.status(200).json({message: 'Login successful', token});
        }

        // If login credentials invalid, report error
        catch (error) {
            res.status(500).json({error: 'Error logging in'});
        }
    }
);

// Middleware to authenticate user for posts and interactions
const authenticatedUser = (req, res, next) => {
    // Extract JWT token from request header
    const token = req.header('Authorization')?.split(' ')[1];
    // Report error if user token not present
    if (!token) {
        return res.status(401).json({error: 'You are not logged in. Please login to continue'});
    }
    
    try {
        // Verify user token
        const decoded = jwt.verify(token, 'your_jwt_secret');
        console.log("Decoded token:", decoded);
        // Attach extracted user information to request
        req.user = decoded;
        next();
    }
    // Report error if user token not valid
    catch (error) {
        console.error("Error verifying token:", error.message);
        res.status(401).json({error: 'Session expired. Please login to continue'});
    }
};

// Export registration and login router for use
module.exports = {router, authenticatedUser};