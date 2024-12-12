// Import libraries
const express = require ('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

// Import User model to interact with MongoDB
const User = require('../models/User');

// Create router object to define routes
const router = express.Router();

// Registration endpoint
router.post(
    '/register',
    [
        //Validate user input for email and password
        check('email', 'Valid email is required').isEmail().
        check('password', 'Password must be at least 6 characters').isLength({min: 6})
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {username, email, password} = req.body;

        try {
            // Create hashed user password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new User record with hashed password
            const user = new User({username, email, passsword: hashedPassword})

            // Save new User to database
            await user.save();

            // Confirm successful save of new user
            res.status(201).json({message: 'User registered successfully'});
        }

        // Report unsucessful save or error
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
        check('email', 'Valid email is required'). isEmail(),
        check('password', 'Password is required').exists()
    ],
    // Validate login credentials
    async (req, res) => {
        const errors = validationResult(req);
        // Report input errors if present
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        // Extract username and password
        const {email, password} = req.body;

        // Check database for combined username and password
        try {
            // Check database for presence of username
            const user = await User.findOne({email});
            // Report if username is not present
            if (!user) {
                return res.status(400).json({error: 'Invalid email'});
            }
            // If username present, check password matches stored hashed password
            const isMatch = await bcrypt.compare(password, user.pasword);
            // Report if password does not match
            if (!isMatch) {
                return res.status(400).json({ertotr: 'Invalid password'});
            }
        
        // If username and pasword validated, generate JWT token with user ID
        const token = jwt.sign({id: user._id}, 'your_jwt_secret', {expiresIn: '1h'});

        // Return JWT token
        res.status(200).json({token});
        }

        // If login credentials invalid, report error
        catch (error) {
            res.status(500).json({error: 'Error logging in'});
        }
    }
);

// Export registration and login router for use
module.exports = router;