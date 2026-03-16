const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authGuard = require('../middleware/authGuard');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authGuard, authController.getMe);
router.put('/profile', authGuard, authController.updateProfile);

module.exports = router;
