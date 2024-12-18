// Import libraries
const express = require('express');
const Post = require('../models/Post');
const {authenticatedUser} = require('./auth');

// Create router object to define routes
const router = express.Router();

// Create a new post (authentication required)
router.post('/create', authenticatedUser, async (req, res) => {
    try {
        console.log("Request body: ", req.body); // Debugging
        console.log("Authenticated user: ", req.user); // Debugging
        // Extract post info from user input and username from token
        const{title, topics, body, expirationTime} = req.body;

        if (!title || !topics || !body || !expirationTime) {
            return res.status(400).json({ error: "Missing required fields" });
        } // Debugging

        // Create new post
        const post = new Post({
            title,
            topics,
            body,
            expirationTime,
            owner: req.user.username
        });
        // Save new post to database
        await post.save();
        // Confirm successful save of new post
        res.status(201).json({message: 'Post created successfully', post});
    }
    catch (error) {
        res.status(500).json({error: 'Error creating post'});
    }
});

// Retrieve all posts
router.get('/all', authenticatedUser, async (req, res) => {
    try {
        // Find all posts
        const posts = await Post.find();
        // Confirm successful retrieval
        res.status(200).json(posts);
    }
    catch (error) {
        res.status(500).json({error: 'Error retrieving posts'});
    }
});

// Retrieve single post by ID
router.get('/:id', authenticatedUser, async (req, res) => {
    try {
        // Find post by ID
        const post = await Post.findById(req.params.id);
        // Confirm successful retrieval
        res.status(200).json(post);
    }
    catch (error) {
        res.status(500).json({error: 'Error retrieving post'});
    }
});

module.exports = router;