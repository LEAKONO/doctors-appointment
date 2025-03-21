const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const sendEmail = require('../config/email');


exports.bookAppointment = async (req, res) => {
    const { doctorId, date } = req.body;
    
    try {
      // Validate input
      if (!doctorId || !date) {
        return res.status(400).json({ msg: 'Doctor ID and date are required' });
      }
  
      // Check doctor existence
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });
  
      // Validate appointment date
      const appointmentDate = new Date(date);
      if (appointmentDate < new Date()) {
        return res.status(400).json({ msg: 'Cannot book appointments in the past' });
      }
  
      // Find exact slot match
      const isoDate = appointmentDate.toISOString();
      const isSlotAvailable = doctor.availableSlots.some(slot => 
        new Date(slot).toISOString() === isoDate
      );
  
      if (!isSlotAvailable) {
        return res.status(400).json({ msg: 'Slot not available' });
      }
  
      // Create appointment
      const appointment = new Appointment({
        patientId: req.userId,
        doctorId,
        date: appointmentDate
      });
  
      // Update doctor's availability
      doctor.availableSlots = doctor.availableSlots.filter(slot => 
        new Date(slot).toISOString() !== isoDate
      );
  
      // Save changes atomically
      await Promise.all([
        appointment.save(),
        doctor.save()
      ]);
  
      // Create notification
      await Notification.create({
        userId: doctor.userId,
        message: `New appointment request from ${req.userId}`
      });
  
      res.status(201).json(appointment);
  
    } catch (err) {
      console.error("❌ Error in booking appointment:", err);
      res.status(500).send('Server error');
    }
  };
  
  exports.updateAppointmentStatus = async (req, res) => {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ msg: 'Only doctors can update appointment status' });
    }
  
    const { status } = req.body;
    try {
      const appointment = await Appointment.findById(req.params.id).populate('patientId', 'email');
      if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });
  
      appointment.status = status;
      await appointment.save();
  
      const emailText = `Your appointment on ${appointment.date} has been ${status}.`;
      await sendEmail(appointment.patientId.email, 'Appointment Status Update', emailText);
  
      res.json(appointment);
    } catch (err) {
      console.error("❌ Error in updateAppointmentStatus:", err);
      res.status(500).send('Server error');
    }
  };
  

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.userId }).populate('doctorId', 'specialty qualifications');
    res.json(appointments);
  } catch (err) {
    res.status(500).send('Server error');
  }
};