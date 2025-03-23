const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/me', authMiddleware, userController.getMe);

router.get('/users', authMiddleware, userController.getUsers);
router.post('/upgrade', authMiddleware, userController.upgradeToDoctor);
router.delete('/:userId', authMiddleware, userController.deleteUser);

module.exports = router;
