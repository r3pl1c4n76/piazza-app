// Import libraries
const express = require('express');
const Post = require('../models/Post');
const {authenticatedUser} = require('./auth');

// Create router object to define routes
const router = express.Router();

// Middleware to authenticate user for all post interactions
router.use(authenticatedUser);

// Create a new post
router.post('/create', async (req, res) => {
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

// Update post by ID
router.put('/:id', async (req, res) => {
    const {title, topics, body, expirationTime} = req.body;
    // Check for missing and non-empty fields
    if (title === "" || topics === "" || body === "" || expirationTime === "") {
        return res.status(400).json({error: 'Fields must not be empty'});
    }
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            {title, topics, body, expirationTime},
            {new: true}
        );
        if (!updatedPost) {
            return res.status(404).json({error: 'Post not found'});
        }
        res.status(200).json({message: 'Post updated successfully', updatedPost});
    }
    catch (error) {
        res.status(500).json({error: 'Error updating post'});
    }
});

// Delete post by ID

// Retrieve all posts
router.get('/all', async (req, res) => {
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
router.get('/:id', async (req, res) => {
    try {
        // Find post by ID
        const post = await Post.findById(req.params.id);
        // If post not found, return error
        if (!post) return res.status(404).json({ error: 'Post not found' });
        // Confirm successful retrieval
        res.status(200).json(post);
    }
    catch (error) {
        res.status(500).json({error: 'Error retrieving post'});
    }
});

// Like a post

// Dislike a post

// Comment on a post


module.exports = router;