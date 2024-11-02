const express = require('express');
const { registerUser, loginUser, getUser, updateUserInfo, updateUserPassword, getAllUsers, getCurrentUser } = require('../controllers/authController');
// const { authenticate } = require('../middleware/auth'); // Middleware to authenticate token
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getUser); // Route for getting the logged-in user's info
router.put('/update', authMiddleware, updateUserInfo);
router.put('/update-password', authMiddleware, updateUserPassword);
router.get('/allusers', getAllUsers)
router.get('/current', authMiddleware, getCurrentUser);

module.exports = router;
