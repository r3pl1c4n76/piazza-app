const express = required('express');
const Post = require('../models/Post');
const router = express.Route();

// Create a new post
router.post('/create', async (req, res) => {
    try {
        // Create new post
        const post = new Post(req.body);
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

module.exports = router;