// Import libraries
const express = require('express');
const Post = require('../models/Post');
const {authenticatedUser} = require('./auth');

// Create router object to define routes
const router = express.Router();

// Middleware to authenticate user for all post interactions
router.use(authenticatedUser);

// Validate post fields
const validatePostFields = (fields) => {
    const errors = [];
    if (!fields.title) {
        errors.push('Title cannot be empty');
    }
    if (!fields.topics || !Array.isArray(fields.topics) || fields.topics.length === 0) {
        errors.push("At least one topic is required.");
    } else if (!fields.topics.every(topic => ['Politics', 'Health', 'Sport', 'Tech'].includes(topic))) {
        errors.push("Permitted topics are Politics, Health, Sport, or Tech.");
    }
    if (!fields.body) {
        errors.push('Post content cannot be empty');
    }
    if (!fields.expirationTime) {
        errors.push('Expiration time must be specified');
    }
    if (errors.length > 0) {
        return errors;
    }
}

// Create a new post
router.post('/create', async (req, res) => {
    // Validate post fields
    const errors = validatePostFields(req.body);
    // If errors exist, return all error responses
    if (errors.length > 0) {
        return res.status(400).json({errors});
    }
    try {
        // Extract post info from user input and username from token
        const{title, topics, body, expirationTime} = req.body;
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
    catch (error) {
        res.status(500).json({error: 'Error creating post'});
    }
});

// Update post by ID - post owner only
router.put('/:id', async (req, res) => {
    // Validate post fields
    const errors = validatePostFields(req.body);
    // If errors exist, return all error responses
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    // Extract post info from user input
    const {title, topics, body, expirationTime} = req.body;
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            {title, topics, body, expirationTime},
            {new: true}
        );
        // Check if post exists
        if (!updatedPost) {
            return res.status(404).json({error: 'Post not found'});
        }
        // Check if user is post owner
        if (updatedPost.owner !== req.user.username) {
            return res.status(403).json({error: 'Only the post owner can update the post'});
        }
        // Save updated post
        await updatedPost.save();
        // Confirm successful update of post
        res.status(200).json({message: 'Post updated successfully', updatedPost});
    }
    catch (error) {
        res.status(500).json({error: 'Error updating post'});
    }
});

// Delete post by ID - post owner only
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({error: 'Post not found'});
        }
        if (post.owner !== req.user.username) {
            return res.status(403).json({error: 'Only the post owner can delete the post'});
        }
        await post.remove();
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