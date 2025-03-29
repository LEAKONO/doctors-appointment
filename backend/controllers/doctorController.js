const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const sendEmail = require('../config/email');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (should be in config file but included here for completeness)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;
  
  try {
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting Cloudinary image:', error);
  }
};

exports.setAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can set availability' });
    }

    const { availableSlots } = req.body;
    if (!Array.isArray(availableSlots)) {
      return res.status(400).json({ success: false, message: 'Available slots must be an array' });
    }

    const validSlots = availableSlots
      .map(slot => new Date(slot))
      .filter(date => !isNaN(date) && date > new Date())
      .map(date => date.toISOString());

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId, isDeleted: { $ne: true } },
      { $addToSet: { availableSlots: { $each: validSlots } } }, // Using $addToSet to prevent duplicates
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, availableSlots: doctor.availableSlots });
  } catch (err) {
    console.error("Error in setAvailability:", err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const { name, specialty, qualifications, ...otherData } = req.body;
    
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId, isDeleted: { $ne: true } },
      { specialty, qualifications, ...otherData },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (name) {
      await User.findByIdAndUpdate(
        req.user.userId,
        { name },
        { new: true, runValidators: true }
      );
    }

    res.json({ 
      success: true, 
      message: "Profile updated successfully", 
      doctor: updatedDoctor 
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ 
      userId: req.user.userId,
      isDeleted: { $ne: true }
    });

    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor profile not found',
        appointments: [] 
      });
    }

    const appointments = await Appointment.find({ 
      doctorId: doctor._id,
      status: { $ne: 'cancelled' } 
    })
    .populate({
      path: 'patientId',
      match: { isDeleted: { $ne: true } },
      select: 'name email phone'
    })
    .sort({ date: 1 })
    .lean();

    const validAppointments = (appointments || []).filter(app => app.patientId !== null)
      .map(appointment => ({
        _id: appointment._id,
        date: appointment.date,
        status: appointment.status || 'pending',
        patientId: appointment.patientId || {
          _id: null,
          name: 'Deleted Patient',
          email: '',
          phone: ''
        },
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt
      }));

    res.json({ 
      success: true, 
      appointments: validAppointments 
    });
  } catch (err) {
    console.error("Error in getAppointments:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      appointments: [], 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ 
      userId: req.user.userId,
      isDeleted: { $ne: true } 
    }).populate({
      path: 'userId',
      match: { isDeleted: { $ne: true } }, 
      select: 'name email phone'
    });

    if (!doctor || !doctor.userId) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const profileData = {
      _id: doctor._id,
      name: doctor.userId.name,
      email: doctor.userId.email,
      phone: doctor.userId.phone,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications,
      profileImage: doctor.profileImage,
      availableSlots: doctor.availableSlots,
      bio: doctor.bio,
      consultationFee: doctor.consultationFee
    };

    res.json({ success: true, doctor: profileData });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const { specialty } = req.query;
    const filter = { isDeleted: { $ne: true } };
    
    if (specialty) {
      filter.specialty = { $regex: new RegExp(specialty, 'i') };
    }

    const doctors = await Doctor.find(filter)
      .populate({
        path: 'userId',
        match: { isDeleted: { $ne: true } },
        select: 'name email phone'
      })
      .lean();

    const formattedDoctors = doctors
      .filter(doctor => doctor.userId !== null) 
      .map(doctor => ({
        _id: doctor._id,
        userId: doctor.userId?._id || null,
        name: doctor.userId?.name || 'Unknown Doctor',
        email: doctor.userId?.email || '',
        phone: doctor.userId?.phone || '',
        specialty: doctor.specialty || 'General Practitioner',
        qualifications: doctor.qualifications || '',
        profileImage: doctor.profileImage || '/default-profile.jpg',
        availableSlots: Array.isArray(doctor.availableSlots) ? doctor.availableSlots : [],
        consultationFee: doctor.consultationFee || 0,
        rating: doctor.rating || 0
      }));

    res.json({ 
      success: true,
      doctors: formattedDoctors 
    });

  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).json({ 
      success: false,
      doctors: [], 
      message: 'Failed to fetch doctors',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status. Must be one of: pending, confirmed, completed, cancelled' 
      });
    }

    const appointment = await Appointment.findById(id)
      .populate({
        path: 'patientId',
        match: { isDeleted: { $ne: true } },
        select: 'name email phone'
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          match: { isDeleted: { $ne: true } },
          select: 'name email'
        }
      });

    if (!appointment || !appointment.patientId) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const requestingDoctor = await Doctor.findOne({ 
      userId: req.user.userId,
      isDeleted: { $ne: true } 
    });

    if (!requestingDoctor || !appointment.doctorId._id.equals(requestingDoctor._id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to update this appointment' 
      });
    }

    appointment.status = status;
    await appointment.save();

    if (['confirmed', 'cancelled'].includes(status)) {
      const formattedDate = new Date(appointment.date).toLocaleString();
      const doctorName = appointment.doctorId.userId.name;
      const patientName = appointment.patientId.name;

      const subject = status === 'confirmed' 
        ? `Appointment Confirmed with Dr. ${doctorName}`
        : `Appointment Cancellation Notice`;

      const message = status === 'confirmed'
        ? `Dear ${patientName},\n\nYour appointment on ${formattedDate} has been confirmed.`
        : `Dear ${patientName},\n\nYour appointment on ${formattedDate} has been cancelled.`;

      await sendEmail({
        email: appointment.patientId.email,
        subject,
        text: message
      });
    }

    res.json({ success: true, appointment });
  } catch (err) {
    console.error("Error in updateAppointmentStatus:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};

exports.uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      message: "No image file provided" 
    });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Only JPG, PNG, GIF, and WebP images are allowed"
    });
  }

  const maxSize = 5 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: "Image size exceeds 5MB limit"
    });
  }

  try {
    const doctor = await Doctor.findOne({ 
      userId: req.user.userId,
      isDeleted: { $ne: true } 
    });

    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: "Doctor profile not found" 
      });
    }

    if (doctor.profileImage) {
      await deleteCloudinaryImage(doctor.profileImage);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'doctor_profiles',
      public_id: `profile_${req.user.userId}_${Date.now()}`,
      overwrite: true,
      invalidate: true,
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    }).catch(err => {
      throw new Error(`Cloudinary upload failed: ${err.message}`);
    });

    doctor.profileImage = result.secure_url;
    await doctor.save();

    res.json({
      success: true,
      profileImage: result.secure_url,
      message: "Profile image updated successfully"
    });

  } catch (error) {
    console.error("Profile upload error:", {
      message: error.message,
      stack: error.stack,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });

    res.status(500).json({
      success: false,
      message: "Failed to upload profile image",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    }
  }
};
