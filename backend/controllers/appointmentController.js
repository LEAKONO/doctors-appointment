const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');

exports.bookAppointment = async (req, res) => {
    const { doctorId, date } = req.body;
    try {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });
  
      console.log("🔍 Doctor Available Slots:", doctor.availableSlots.map(slot => slot.toISOString())); 
      console.log("🔍 Requested Date:", new Date(date).toISOString());
  
      console.log("🔍 User Making the Request (req.userId):", req.userId);
  
      if (!req.userId) {
        console.log("❌ Missing req.userId!");
        return res.status(401).json({ msg: "Unauthorized: No patient ID found" });
      }
  
      const isSlotAvailable = doctor.availableSlots.some(slot => 
        new Date(slot).toISOString() === new Date(date).toISOString()
      );
  
      if (!isSlotAvailable) {
        console.log("❌ Slot not found in available slots");
        return res.status(400).json({ msg: 'Slot not available' });
      }
  
      const appointment = new Appointment({
        patientId: req.userId,  // ✅ Fix: Ensure patientId is set
        doctorId,
        date,
      });
  
      await appointment.save();
  
      doctor.availableSlots = doctor.availableSlots.filter(slot => 
        new Date(slot).toISOString() !== new Date(date).toISOString()
      );
      await doctor.save();
  
      const notification = new Notification({
        userId: doctor.userId,
        message: `New appointment request from ${req.userId}`,
      });
  
      await notification.save();
  
      res.status(201).json(appointment);
    } catch (err) {
      console.error("❌ Error in booking appointment:", err);
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