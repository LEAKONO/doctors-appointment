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
// controllers/doctorController.js
exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId })
      .populate('userId', 'name email')
      .select('-password');

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const profileImageUrl = doctor.profileImage 
      ? `${process.env.BASE_URL}/${doctor.profileImage}`
      : null;

    const responseData = {
      ...doctor._doc,
      name: doctor.userId.name, 
      email: doctor.userId.email,
      profileImage: profileImageUrl,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    console.log('✅ Checking if Doctor.find exists:', typeof Doctor.find === 'function');

    const doctors = await Doctor.find()
      .populate('userId', 'name email')
      .lean(); 

    const formattedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.userId?.name || 'Unnamed Doctor',
      email: doctor.userId?.email || 'No email',
      specialty: doctor.specialty,
      qualifications: doctor.qualifications,
      profileImage: doctor.profileImage ? `${process.env.BASE_URL}/${doctor.profileImage}` : null,
      availableSlots: doctor.availableSlots || [],
    }));

    console.log("📋 Retrieved Doctors:", formattedDoctors);
    res.status(200).json(formattedDoctors);
  } catch (err) {
    console.error("❌ Error fetching doctors:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
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
      if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
      }

      const imagePath = `uploads/${req.file.filename}`;
      const fullImageUrl = `${process.env.BASE_URL}/${imagePath}`;

      // Update doctor's profile in the database
      const doctor = await Doctor.findByIdAndUpdate(
          req.user.id,
          { profileImage: imagePath },
          { new: true }
      );

      res.json({ profileImage: fullImageUrl });
  } catch (error) {
      res.status(500).json({ message: "Error uploading image", error: error.message });
  }
};
