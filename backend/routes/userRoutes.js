const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', authMiddleware, userController.getMe);

// 🔹 Admin-only route to upgrade a patient to a doctor
router.post('/upgrade-to-doctor', authMiddleware, userController.upgradeToDoctor);

module.exports = router;