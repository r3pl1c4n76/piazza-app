// Import libraries
const express = require('express');
const Post = require('../models/Post');

// Import interaction-specific middleware
const authenticateUser = require('./auth');
const validatePostCreate = require('../middleware/validatePostCreate');
const validatePostUpdate = require('../middleware/validatePostUpdate');
const verifyPostID = require('../middleware/verifyPostID');
const verifyPostOwner = require('../middleware/verifyPostOwner');
const verifyPostStatus = require('../middleware/verifyPostStatus');

// Create router object to define routes
const router = express.Router();

// Set middleware for authentication users for all interactions
router.use(authenticateUser);

///////////////////////////////////// 5. Prevent post owner interactions
const preventOwnerInteract = (req, res, next) => {
    if (req.post.owner === req.user.username) {
        return res.status(403).json({ error: "Post owner cannot like or dislike their own post" });
    }
    next();
};

// Create a new post
router.post('/create', validatePostCreate, async (req, res) => {
    try {
        // Extract post info from user input and username from token
        const {title, topics, body, expirationTime} = req.body;
        // Create new post
        const post = new Post({
            title,
            topics,
            body,
            expirationTime,
            owner: req.user.username
        });
        // Save new post
        await post.save();
        // Confirm successful save of new post
        res.status(201).json({message: 'Post created successfully', post});
    }
    // Report error if post creation fails
    catch (error) {
        res.status(500).json({error: 'Error creating post'});
    }
});

// Update post by ID - post owner only, post content validation
router.put('/:id', verifyPostID, validatePostUpdate, verifyPostOwner, async (req, res) => {
    // Extract post info from user input
    const {title, topics, body, expirationTime} = req.body;
    try {
        const updatedPost = req.body;
        const post = Object.assign(req.post, updatedPost);
        await post.save();
        // Confirm successful update of post
        res.status(200).json({message: 'Post updated successfully', updatedPost});
    }
    catch (error) {
        res.status(500).json({error: 'Error updating post'});
    }
});

// Delete post by ID - post owner only
router.delete('/:id', verifyPostID, verifyPostOwner, async (req, res) => {
    try {
        // Delete post
        await req.post.remove();
        // Confirm successful deletion of post
        res.status(200).json({message: 'Post deleted successfully'});
    }
    catch (error) {
        res.status(500).json({error: 'Error deleting post'});
    }
});

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