const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/book', authMiddleware, appointmentController.bookAppointment);
router.get('/my-appointments', authMiddleware, appointmentController.getMyAppointments);
router.delete('/cancel/:appointmentId', authMiddleware, appointmentController.cancelAppointment);

module.exports = router;