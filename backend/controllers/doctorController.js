const Doctor = require('../models/Doctor');
const mongoose = require("mongoose");
const sendEmail = require('../config/email');


const Appointment = require('../models/Appointment');

exports.setAvailability = async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ msg: 'Only doctors can set availability' });
  }

  const { availableSlots } = req.body;

  try {
      if (!Array.isArray(availableSlots)) {
          return res.status(400).json({ msg: 'Available slots must be an array' });
      }

      const validSlots = availableSlots
          .map(slot => new Date(slot))
          .filter(date => !isNaN(date) && date > new Date())
          .map(date => date.toISOString());

      console.log("🟢 Valid Slots to Save:", validSlots);

      const doctor = await Doctor.findOneAndUpdate(
          { userId: req.user.userId },
          { $push: { availableSlots: { $each: validSlots } } },  // ✅ Fix: Append instead of overwrite
          { new: true, runValidators: true }
      );

      if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

      console.log("🟢 Updated Doctor:", doctor);

      res.json(doctor);
  } catch (err) {
      console.error("❌ Error in setAvailability:", err);
      res.status(500).send('Server error');
  }
};


exports.getAppointments = async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ msg: 'Only doctors can view appointments' });
  }

  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name email');

    res.json(appointments);
  } catch (err) {
    console.error("❌ Error in getAppointments:", err);
    res.status(500).send('Server error');
  }
};
exports.getAllDoctors = async (req, res) => {
    try {
      const { specialty } = req.query;
      const query = specialty ? { specialty: { $regex: specialty, $options: 'i' } } : {};
      const doctors = await Doctor.find(query).populate('userId', 'name email');
      res.json(doctors);
    } catch (err) {
      console.error("❌ Error in getAllDoctors:", err);
      res.status(500).send('Server error');
    }
  };

  exports.updateAppointmentStatus = async (req, res) => {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ msg: 'Only doctors can update appointment status' });
    }
  
    const { status } = req.body;
    try {
      const appointment = await Appointment.findById(req.params.id).populate('patientId', 'email name');
      if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });
  
      appointment.status = status;
      await appointment.save();
  
      const emailText = `Your appointment on ${new Date(appointment.date).toLocaleDateString()} 
        at ${new Date(appointment.date).toLocaleTimeString()} has been ${status}.`;
  
      await sendEmail(
        appointment.patientId.email,
        `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        emailText
      );
  
      console.log(`📧 Email sent to ${appointment.patientId.email}`);
      res.json(appointment);
    } catch (err) {
      console.error("❌ Error in updateAppointmentStatus:", err);
      res.status(500).send('Server error');
    }
  };
  