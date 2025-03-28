const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const sendEmail = require('../config/email');
const path = require('path');
const fs = require('fs');

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
      { userId: req.user.userId, isDeleted: { $ne: true } }, // Add isDeleted check
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

exports.updateDoctorProfile = async (req, res) => {
  try {
    const { name, specialty, qualifications, ...otherData } = req.body;
    
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId, isDeleted: { $ne: true } }, // Add isDeleted check
      { specialty, qualifications, ...otherData },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) return res.status(404).json({ message: "Doctor not found" });
    if (name) await User.findByIdAndUpdate(req.user.userId, { name }, { new: true });

    res.json({ message: "Profile updated successfully", doctor: updatedDoctor });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ 
      userId: req.user.userId,
      isDeleted: { $ne: true } // Add isDeleted check
    });
    if (!doctor) return res.status(404).json({ msg: 'Doctor profile not found' });

    const appointments = await Appointment.find({ 
      doctorId: doctor._id,
      patientId: { $exists: true, $ne: null } // Only show appointments with existing patients
    }).populate({
      path: 'patientId',
      match: { _id: { $exists: true }, isDeleted: { $ne: true } }, // Ensure patient exists and not deleted
      select: 'name email'
    });

    // Filter out any appointments with deleted patients
    const validAppointments = appointments.filter(app => app.patientId !== null);
    res.json(validAppointments);
  } catch (err) {
    console.error("❌ Error in getAppointments:", err);
    res.status(500).send('Server error');
  }
};

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ 
      userId: req.user.userId,
      isDeleted: { $ne: true } // Add isDeleted check
    })
      .populate({
        path: 'userId',
        match: { isDeleted: { $ne: true } }, // Ensure user not deleted
        select: 'name email'
      })
      .select('-password');

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({
      ...doctor._doc,
      name: doctor.userId.name, 
      email: doctor.userId.email,
      profileImage: doctor.profileImage ? `http://localhost:5000${doctor.profileImage}` : null
    });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isDeleted: { $ne: true } }) // Only fetch non-deleted doctors
      .populate({
        path: 'userId',
        match: { isDeleted: { $ne: true } }, // Only include doctors with existing and non-deleted users
        select: 'name email'
      })
      .lean();

    // Filter out doctors with deleted users
    const validDoctors = doctors.filter(doctor => doctor.userId !== null);

    const formattedDoctors = validDoctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.userId.name,
      email: doctor.userId.email,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications,
      profileImage: doctor.profileImage 
        ? doctor.profileImage.startsWith('http') 
          ? doctor.profileImage 
          : `http://localhost:5000${doctor.profileImage}`
        : null,
      availableSlots: doctor.availableSlots || []
    }));

    res.status(200).json(formattedDoctors);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status. Must be one of: pending, confirmed, rejected' 
      });
    }

    const appointment = await Appointment.findById(id)
      .populate({
        path: 'patientId',
        match: { isDeleted: { $ne: true } }, // Ensure patient exists and not deleted
        select: 'name email'
      })
      .populate({
        path: 'doctorId',
        select: 'userId specialty',
        populate: {
          path: 'userId',
          match: { isDeleted: { $ne: true } }, // Ensure doctor user exists and not deleted
          select: 'name email'
        }
      });

    if (!appointment || !appointment.patientId) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const requestingDoctor = await Doctor.findOne({ 
      userId: req.user.userId,
      isDeleted: { $ne: true } // Ensure requesting doctor exists and not deleted
    });
    if (!requestingDoctor || !appointment.doctorId._id.equals(requestingDoctor._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this appointment' });
    }

    appointment.status = status;
    await appointment.save();

    if (status === 'confirmed' || status === 'rejected') {
      const formattedDate = new Date(appointment.date).toLocaleString();
      const doctorName = appointment.doctorId.userId.name;
      const patientName = appointment.patientId.name;

      const subject = status === 'confirmed' 
        ? `Appointment Confirmed with Dr. ${doctorName}`
        : `Appointment Cancellation Notice`;

      const message = status === 'confirmed'
        ? `Dear ${patientName},\n\nYour appointment on ${formattedDate} has been confirmed.`
        : `Dear ${patientName},\n\nYour appointment on ${formattedDate} has been cancelled.`;

      await sendEmail(appointment.patientId.email, subject, message);
    }

    res.json({ success: true, appointment });
  } catch (err) {
    console.error("❌ Error in updateAppointmentStatus:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    const filePath = path.join(__dirname, '../uploads/profiles', req.file.filename);
    
    if (!fs.existsSync(filePath)) {
      console.error('File verification failed:', filePath);
      return res.status(500).json({ message: "File was not saved correctly" });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId, isDeleted: { $ne: true } }, // Add isDeleted check
      { profileImage: imageUrl },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({ profileImage: imageUrl, message: "Profile image updated successfully" });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ message: "Error uploading image", error: error.message });
  }
};