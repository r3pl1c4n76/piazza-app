// Import Mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Define database schema for User model
// Required fields are username, email and password
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Export User model to database to perform CRUD actions
module.exports = mongoose.model('User', UserSchema);

