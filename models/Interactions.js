const mongoose = require('mongoose');

// Define database schema for post interactions
const InteractionSchema = new mongoose.Schema({
    postID: {type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true},
    type: {
        type: String,
        // Type limited to following options
        enum: ['Like', 'Dislike', 'Comment'],
        required: true
    },
    user: {type: String, required: true},
    comment: {type: String},
    timestamp: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Interaction', InteractionSchema);