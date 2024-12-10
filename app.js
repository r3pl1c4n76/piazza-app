// 1. Import libraries
const express = require('express');
const app = express();

// 2. Create route
app.get('/', (req, res) => {
    res.send('You are in your homepage!');
});

// 3. Start server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
