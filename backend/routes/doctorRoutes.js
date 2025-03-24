const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // IMPORT HERE

router.patch(
  '/profile-image',
  authMiddleware,
  upload.single('profileImage'), 
  doctorController.uploadProfileImage
);
router.get('/profile', authMiddleware, doctorController.getDoctorProfile);
router.get('/all-doctors', doctorController.getAllDoctors);
router.post('/set-availability', authMiddleware, doctorController.setAvailability);
router.get('/appointments', authMiddleware, doctorController.getAppointments);
router.put('/appointments/:id', authMiddleware, doctorController.updateAppointmentStatus);

module.exports = router;