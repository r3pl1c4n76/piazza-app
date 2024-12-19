const mongoose = require('mongoose');

// Define database schema for post interactions
const InteractionSchema = new mongoose.Schema({
    postID: {type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true},
    type: {
        type: String,
        // Interaction type limited to following options
        enum: ['Like', 'Dislike', 'Comment'],
        required: true
    },
    user: {type: String, required: true},
    // Comment field only required for type: comment
    comment: {type: String},
    timestamp: {type: Date, default: Date.now}
});

// Export Interaction model to database to perform CRUD actions
module.exports = mongoose.model('Interaction', InteractionSchema);