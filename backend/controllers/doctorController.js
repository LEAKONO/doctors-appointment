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

exports.updateDoctorProfile = async (req, res) => {
  try {
    const { name, specialty, qualifications, ...otherData } = req.body;
    
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId },
      { specialty, qualifications, ...otherData },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (name) {
      await User.findByIdAndUpdate(req.user.userId, { name }, { new: true });
    }

    res.json({
      message: "Profile updated successfully",
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId })
      .populate('userId', 'name email')
      .select('-password');

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const profileImageUrl = doctor.profileImage 
      ? `http://localhost:5000${doctor.profileImage}`
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
    const doctors = await Doctor.find()
      .populate('userId', 'name email')
      .lean();

    const formattedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.userId?.name || 'Unnamed Doctor',
      email: doctor.userId?.email || 'No email',
      specialty: doctor.specialty,
      qualifications: doctor.qualifications,
      profileImage: doctor.profileImage 
        ? doctor.profileImage.startsWith('http') 
          ? doctor.profileImage 
          : `http://localhost:5000${doctor.profileImage}`
        : null,
      availableSlots: doctor.availableSlots || [],
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
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        select: 'userId specialty',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    const requestingDoctor = await Doctor.findOne({ userId: req.user.userId });
    if (!requestingDoctor || !appointment.doctorId._id.equals(requestingDoctor._id)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this appointment'
      });
    }

    appointment.status = status;
    await appointment.save();

    const formattedDate = new Date(appointment.date).toLocaleString();
    const doctorName = appointment.doctorId?.userId?.name || 'Our Doctor';
    const patientName = appointment.patientId?.name || 'Patient';

    if (status === 'confirmed') {
      await sendEmail(
        appointment.patientId.email,
        `Appointment Confirmed with Dr. ${doctorName}`,
        `Dear ${patientName},\n\n` +
        `Your appointment on ${formattedDate} with Dr. ${doctorName} (${appointment.doctorId.specialty}) has been confirmed.\n\n` +
        `We look forward to seeing you!\n\n` +
        `Best regards,\nThe Medical Team`
      );
    } else if (status === 'rejected') {
      await sendEmail(
        appointment.patientId.email,
        `Appointment Cancellation Notice`,
        `Dear ${patientName},\n\n` +
        `We regret to inform you that your appointment on ${formattedDate} with Dr. ${doctorName} (${appointment.doctorId.specialty}) has been cancelled.\n\n` +
        `Please contact our office to reschedule or for more information.\n\n` +
        `We apologize for any inconvenience.\n\n` +
        `Best regards,\nThe Medical Team`
      );
    }

    res.json({
      success: true,
      appointment: {
        _id: appointment._id,
        date: appointment.date,
        status: appointment.status,
        patientId: {
          _id: appointment.patientId._id,
          name: appointment.patientId.name,
          email: appointment.patientId.email
        },
        doctorId: {
          _id: appointment.doctorId._id,
          specialty: appointment.doctorId.specialty,
          userId: {
            _id: appointment.doctorId.userId._id,
            name: appointment.doctorId.userId.name
          }
        }
      }
    });

  } catch (err) {
    console.error("❌ Error in updateAppointmentStatus:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    
    const filePath = path.join(__dirname, '../uploads/profiles', req.file.filename);
    
    if (!fs.existsSync(filePath)) {
      console.error('File verification failed. Expected at:', filePath);
      return res.status(500).json({ message: "File was not saved correctly" });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId },
      { profileImage: imageUrl },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ 
      profileImage: imageUrl,
      message: "Profile image updated successfully" 
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ 
      message: "Error uploading image",
      error: error.message
    });
  }
};