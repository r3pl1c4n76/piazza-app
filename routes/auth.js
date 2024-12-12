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

            // Confirm successful save
            res.status(201).json({message: 'User registered successfully'});
        }

        catch (error) {
            res.status(500).json({error: 'Error registering user'});
        }
    }
);
