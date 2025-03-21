const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.register); // Register a new user
router.post('/login', userController.login); // Login a user

// Authenticated routes
router.get('/me', authMiddleware, userController.getMe); // Get logged-in user's profile

// Admin-only routes
router.get('/all-patients', authMiddleware, userController.getAllPatients);
router.post('/upgrade-to-doctor', authMiddleware, userController.upgradeToDoctor); // Upgrade a patient to a doctor
router.delete('/patients/:userId', authMiddleware, userController.deletePatient); // Delete a patient
router.get('/all-users', authMiddleware, userController.getAllUsers); // Get all users (admin-only)

module.exports = router;