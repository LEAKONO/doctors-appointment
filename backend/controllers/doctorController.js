const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const sendEmail = require('../config/email');

exports.setAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ msg: 'Only doctors can set availability' });
    }

    const { availableSlots } = req.body;
    if (!Array.isArray(availableSlots)) {
      return res.status(400).json({ msg: 'Available slots must be an array' });
    }

    const validSlots = availableSlots
      .map(slot => new Date(slot))
      .filter(date => !isNaN(date) && date > new Date())
      .map(date => date.toISOString());

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId },
      { $push: { availableSlots: { $each: validSlots } } },
      { new: true, runValidators: true }
    );

    if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

    res.json(doctor);
  } catch (err) {
    console.error("❌ Error in setAvailability:", err);
    res.status(500).send('Server error');
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) return res.status(404).json({ msg: 'Doctor profile not found' });

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
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'email name');
    
    if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

    appointment.status = req.body.status;
    await appointment.save();

    const formattedDate = new Date(appointment.date).toLocaleString();
    await sendEmail(
      appointment.patientId.email,
      `Appointment ${req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1)}`,
      `Dear ${appointment.patientId.name},\n\nYour appointment on ${formattedDate} has been ${req.body.status}.\n\nBest regards,\nThe Medical Team`
    );

    res.json(appointment);
  } catch (err) {
    console.error("❌ Error in updateAppointmentStatus:", err);
    res.status(500).send('Server error');
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No image uploaded' });

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId },
      { profileImage: req.file.path },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    
    res.json({
      msg: 'Profile image updated successfully',
      profileImage: `${baseUrl}/${doctor.profileImage}`
    });
  } catch (err) {
    console.error("❌ Error uploading profile image:", err);
    res.status(500).send('Server error');
  }
};