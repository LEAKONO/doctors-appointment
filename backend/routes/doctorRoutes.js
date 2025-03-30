const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 

router.post(
  '/upload-profile',
  authMiddleware,
  upload.single('image'),  
  doctorController.uploadProfileImage
);

router.post('/profile', authMiddleware, doctorController.updateDoctorProfile);
router.get('/profile', authMiddleware, doctorController.getDoctorProfile);
router.get('/all-doctors', doctorController.getAllDoctors);
router.post('/set-availability', authMiddleware, doctorController.setAvailability);
router.get('/availability', authMiddleware, doctorController.getAvailability);
router.delete('/availability', authMiddleware, doctorController.deleteAvailability);
router.get('/appointments', authMiddleware, doctorController.getAppointments);
router.put('/appointments/:id', authMiddleware, doctorController.updateAppointmentStatus);

module.exports = router;