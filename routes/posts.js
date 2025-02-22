// Import libraries
const express = require('express');
const Post = require('../models/Post');
const Interaction = require('../models/Interactions');

// Import interaction-specific middleware
const authenticateUser = require('../middleware/authenticateUser');
const validatePostCreate = require('../middleware/validatePostCreate');
const validatePostUpdate = require('../middleware/validatePostUpdate');
const verifyPostID = require('../middleware/verifyPostID');
const verifyPostOwner = require('../middleware/verifyPostOwner');
const verifyPostStatus = require('../middleware/verifyPostStatus');

// Create router object to define routes
const router = express.Router();

// Retrieve valid topics
const validTopics = Post.schema.path('topics').caster.enumValues;

// Set middleware for authentication users for all interactions
router.use(authenticateUser);

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

// 1. Interact with post
// 1.1 Update post by ID - post owner only, validate content
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
    // Report error if post update fails
    catch (error) {
        res.status(500).json({error: 'Error updating post'});
    }
});

// 1.2 Delete post by ID - post owner only
router.delete('/:id', verifyPostID, verifyPostOwner, async (req, res) => {
    try {
        // Delete post
        await req.post.remove();
        // Confirm successful deletion of post
        res.status(200).json({message: 'Post deleted successfully'});
    }
    // Report error if post deletion fails
    catch (error) {
        res.status(500).json({error: 'Error deleting post'});
    }
});

// 1.3 Like a post - prevent post owner interaction
router.post('/:id/like', verifyPostID, verifyPostStatus, async (req, res) => {
    try {
        // Get post ID from request
        const post = req.post;
        // Prevent post owner from liking their own post
        if (post.owner === req.user.username) {
            return res.status(403).json({ error: 'Post owner cannot like their own post' });
        };
        const existingInteraction = await Interaction.findOne({
            postID: post._id, 
            user: req.user.username, 
            type: 'Like' });
        if (existingInteraction) {
            return res.status(400).json({ error: 'You have already liked this post' });
        }
        // Increment likes count
        req.post.likes += 1;
        await post.save();

        // Create new interaction record
        await Interaction.create({
            postID: post._id,
            type: 'Like',
            user: req.user.username
        });
        // Confirm successful like
        res.status(200).json({ message: 'Post liked', post: req.post });
    } 
    // Report error if post like fails
    catch (error) {
        res.status(500).json({ error: 'Error liking post' });
    }
});

// 1.4 Dislike a post
router.post('/:id/dislike', verifyPostID, verifyPostStatus, async (req, res) => {
    try {
        // Get post ID from request
        const post = req.post;
        // Prevent post owner from disliking their own post
        if (post.owner === req.user.username) {
            return res.status(403).json({error: 'Post owner cannot dislike their own post'});
        }
        const existingInteraction = await Interaction.findOne({
            postID: post._id, 
            user: req.user.username, 
            type: 'Dislike'
        });
        if (existingInteraction) {
            return res.status(400).json({error: 'You have already disliked this post'});
        }
        // Increment dislikes count
        req.post.dislikes += 1;
        await post.save();

        // Create new interaction record
        await Interaction.create({
            postID: post._id,
            type: 'Dislike',
            user: req.user.username
        });
        // Confirm successful dislike
        res.status(200).json({ message: 'Post disliked', post: req.post });
    } 
    // Report error if post dislike fails
    catch (error) {
        res.status(500).json({ error: 'Error disliking post' });
    }
});

// 1.5 Comment on a post
router.post('/:id/comment', verifyPostID, verifyPostStatus, async (req, res) => {
    try {
        const {comment} = req.body;
        // Check if comment is empty
        if (!comment) {
            return res.status(400).json({ error: 'Comment cannot be empty' });
        }
        // Create new comment
        const interaction = await Interaction.create({
            postID: req.post._id,
            type: 'Comment',
            user: req.user.username,
            comment: comment
        });
        // Increment comments count
        req.post.commentsCount += 1;
        // Save post with new comment
        await req.post.save();
        // Confirm successful comment
        res.status(201).json({message: 'Comment added', post: req.post});
    } catch (error) {
        res.status(500).json({error: 'Error adding comment'});
    }
});

// 1.6 Retrieve all comments for a post
router.get('/:id/comments', verifyPostID, async (req, res) => {
    try {
        const post = req.post;
        // Retrieve comments for post
        const comments = await Interaction.find({
            postID: post._id, 
            type: 'Comment' })
            .select('user comment timestamp');
        // Check if post has comments
        if (!comments || comments.length === 0) {
            return res.status(404).json({ error: 'This post has no comments' });
        }
        res.status(200).json({message: "Comments: ", comments});
    } catch (error) {
        res.status(500).json({error: 'Error retrieving comments'});
    }
});

// 2. Retrieve posts
// 2.1 Retrieve all posts
router.get('/all', async (req, res) => {
    try {
        // Find all posts
        const posts = await Post.find().sort({timestamp: -1});
        // Confirm successful retrieval
        res.status(200).json({message: 'Most recent posts: ', posts});
    }
    catch (error) {
        res.status(500).json({error: 'Error retrieving posts'});
    }
});

// 2.2 Retrieve single post by ID
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

// 2.3 Retrieve all posts by user
router.get('/user/:username', async (req, res) => {
    try {
        // Find posts by username
        const username = req.params.username;
        const posts = await Post.find({owner: username});
        // If no posts found, return error
        if (!posts || posts.length === 0) {
            return res.status(404).json({error: 'No posts found for this user'});
        }
        // Confirm successful retrieval
        res.status(200).json({message: 'Posts by user: $(username)', posts});
    }
    // Report error if post retrieval fails
    catch (error) {
        res.status(500).json({error: 'Error retrieving posts'});
    }
});

// 2.4 Retrieve all posts by topic, most recent first
router.get('/topic/:topic', async (req, res) => {
    try {
        const {topic} = req.params;
        // Validate the topic
        if (!validTopics.includes(topic)) {
            return res.status(400).json({error: 'Invalid topic. Choose from Politics, Health, Sport, or Tech.'});
        }
        // Find posts by topic
        const postsByTopic = await Post.find({topics: topic}).sort({timestamp: -1});
        // Confirm successful retrieval
        res.status(200).json({message: `Posts for topic: ${topic}`, postsByTopic});
    }
    // Report error if post retrieval fails
    catch (error) {
        res.status(500).json({error: 'Error retrieving posts'});
    }
});

// 2.5 Retrieve live post with most interactions by topic
router.get('/:topic/popular/live', async (req, res) => {
    try {
        const {topic} = req.params;
        // Validate the topic
        if (!validTopics.includes(topic)) {
            return res.status(400).json({ error: 'Invalid topic. Choose from Politics, Health, Sport, or Tech.' });
        }
        // Retrieve post with most interactions for topic
        const mostPopularPosts = await Post.aggregate([
            {$match: {topics: topic, status: 'Live'}},
            {$addFields: {totalInteractions: {$add: ["$likes", "$dislikes", "$commentsCount"]}}},
            // Sort posts based on total interactions
            {$sort: {totalInteractions: -1}},
            // Show top post
            {$limit: 1}
        ]);
        // Return error if no posts found for topic
        if (!mostPopularPosts.length) {
            return res.status(404).json({error: `No live posts found for topic: ${topic}`});
        }
        // Confirm successful retrieval
        res.status(200).json({
            message: `Most popular post for topic: ${topic}`,
            post: mostPopularPosts[0],
        });
    } 
    // Report error if post retrieval fails
    catch (error) {
        res.status(500).json({error: 'Error retrieving the most popular post'});
    }
});

// 2.6 Retrieve expired post with most interactions by topic
router.get('/:topic/popular/expired', async (req, res) => {
    try {
        const {topic} = req.params;
        // Validate the topic
        if (!validTopics.includes(topic)) {
            return res.status(400).json({ error: 'Invalid topic. Choose from Politics, Health, Sport, or Tech.' });
        }
        // Retrieve post with most interactions for topic
        const mostPopularPosts = await Post.aggregate([
            {$match: {topics: topic, status: 'Expired'}},
            {$addFields: {totalInteractions: {$add: ["$likes", "$dislikes", "$comments"]}}},
            // Sort posts based on total interactions
            {$sort: {totalInteractions: -1}},
            // Show top post
            {$limit: 1}
        ]);
        // Return error if no posts found for topic
        if (!mostPopularPosts.length) {
            return res.status(404).json({error: `No expired posts found for topic: ${topic}`});
        }
        // Confirm successful retrieval
        res.status(200).json({
            message: `Most popular post for topic: ${topic}`,
            post: mostPopularPosts[0],
        });
    } 
    // Report error if post retrieval fails
    catch (error) {
        res.status(500).json({error: 'Error retrieving the most popular post'});
    }
});

module.exports = router;