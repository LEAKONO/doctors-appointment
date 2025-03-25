const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/me', authMiddleware, userController.getMe);
router.get('/', authMiddleware, userController.getUsers);  

// Add multer middleware for the upgrade route
router.post(
  '/upgrade',
  authMiddleware,
  upload.single('profileImage'),  // This handles the file upload
  userController.upgradeToDoctor
);

router.delete('/:userId', authMiddleware, userController.deleteUser);

module.exports = router;