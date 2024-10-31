const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30s' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user); // Respond with user data
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
const updateUserInfo = async (req, res) => {
    const { name, email, oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update email if it’s new and unique
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }

        // Update name if provided
        if (name) {
            user.name = name;
        }

        // Update password if both oldPassword and newPassword are provided
        if (oldPassword && newPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Old password is incorrect' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt); // Encrypt new password
        }

        await user.save();
        res.json({ message: 'User information updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        user.password = newPassword; // `UserSchema` will handle hashing via pre-save hook.
        await user.save();

        res.json({ message: 'Password updated successfully. Please log in again.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser, getUser, updateUserInfo, updateUserPassword, getAllUsers };
