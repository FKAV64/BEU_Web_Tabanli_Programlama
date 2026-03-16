const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authGuard = require('../middleware/authGuard');
const roleGuard = require('../middleware/roleGuard');

// GET /api/admin/users: Get all users with stats
router.get('/users', authGuard, roleGuard, adminController.getAllUsers);

module.exports = router;
