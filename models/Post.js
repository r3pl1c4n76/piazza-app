// Import Mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Define database schema for Post model
// Required fields for post are title, topic(s), body, expirationTime and owner (user)
const PostSchema = new mongoose.Schema({
    title: {type: String, required: true},
    topics: { 
        type: [String], 
        // Topics limited to following options
        enum: ['Politics', 'Health', 'Sport', 'Tech'], 
        required: true 
    },
    timestamp: {type: Date, default: Date.now},
    body: {type: String, required: true},
    expirationTime: {type: Date, required: true},
    status: { 
        type: String, 
        // Status limited to following options
        enum: ['Live', 'Expired'], 
        default: 'Live' 
    },
    owner: {type: String, required: true},
    likes: {
        user: string,
        type: Number, default: 0},
    dislikes: {type: Number, default: 0},
    comments: [
        {
            user: String,
            comment: String,
            timestamp: {type: Date, default: Date.now}
        }
    ]
});

// Update post status based on expirationTime
PostSchema.pre('save', function (next) {
    if (new Date() > this.expirationTime) {
        this.status = 'Expired';
    }
    next();
});

// Export Post model to database to perform CRUD actions
module.exports = mongoose.model('Post', PostSchema);
