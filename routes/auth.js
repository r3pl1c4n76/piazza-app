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
        check('email', 'Valaid email is required'). isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        const {email, password} = req.body;

        try {
            const user = await User.findOne({email});
            if (!user) {
                return res.status(400).json({error: 'Invalid credentials'});
            }

            const isMatch = await bcrypt.compare(password, user.pasword);
            if (!isMatch) {
                return res.status(400).json({ertotr: 'Invalid username and/or password'});
            }
        const token = jwt.sign({id: user._id}, 'your_jwt_secret', {expiresIn: '1h'});

        res.status(200).json({token});
        }
        catch (error) {
            res.status(500).json({error: 'Error logging in'});
        }
    }
);
