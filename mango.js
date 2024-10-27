const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3001;

// MongoDB connection URI (replace with your database URI if using MongoDB Atlas)
const MONGO_URI = 'mongodb://localhost:27017/mydatabase';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serves frontend files in the 'public' directory

// Define User schema and model
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// Route to handle registration
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "Email already registered." });
        }

        // Create and save the new user
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(200).json({ msg: "Registration successful! Please log in." });
    } catch (err) {
        res.status(500).json({ msg: "Error registering user.", error: err.message });
    }
});

// Route to handle login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the email and password match
        const user = await User.findOne({ email, password });
        if (user) {
            return res.status(200).json({ msg: `Welcome back, ${user.name}!` });
        } else {
            return res.status(401).json({ msg: "Invalid email or password." });
        }
    } catch (err) {
        res.status(500).json({ msg: "Error logging in.", error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

