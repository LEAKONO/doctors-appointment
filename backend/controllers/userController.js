const mongoose = require("mongoose");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../config/email");
const cloudinary = require("../config/cloudinary");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body; 

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const isAdminPresent = await User.findOne({ role: "admin" });
    const assignedRole = isAdminPresent ? "patient" : role === "admin" ? "admin" : "patient";

    const user = new User({ name, email, password: hashedPassword, role: assignedRole });
    await user.save();

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token, userId: user.id, role: user.role });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  try {
    const email = String(req.body.email).trim();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, userId: user.id, role: user.role });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    let query = User.findById(req.userId).select("-password"); 
    if (req.userRole === "doctor") {
      query = query.populate("doctorProfile", "name specialty qualifications profileImage availableSlots");
    }

    const user = await query;
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ getMe Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter)
      .select("-password")
      .populate("doctorProfile", "specialty qualifications profileImage availableSlots");

    res.json({
      count: users.length,
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, 
        doctorProfile: user.role === "doctor" ? user.doctorProfile : null, 
      })),
    });
  } catch (err) {
    console.error("❌ User fetch error:", err);
    res.status(500).send("Server error");
  }
};

exports.upgradeToDoctor = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, msg: 'Unauthorized - Only admins can upgrade users' });
    }

    const { userId, specialty, qualifications } = req.body;
    const profileImage = req.file?.path || ''; // Will be Cloudinary URL if uploaded

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, msg: 'Valid user ID is required' });
    }

    if (!specialty || !qualifications) {
      return res.status(400).json({ success: false, msg: 'Specialty and qualifications are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
    if (user.role === 'doctor') return res.status(400).json({ success: false, msg: 'User is already a doctor' });

    const doctor = new Doctor({ 
      userId: user._id, 
      specialty, 
      qualifications, 
      profileImage 
    });
    await doctor.save();

    user.role = 'doctor';
    user.doctorProfile = doctor._id;
    await user.save();

    await sendEmail(user.email, "Your Doctor Account is Ready!", `
      Dear ${user.name},
      🎉 Congratulations! Your account has been successfully upgraded.
      🔹 Specialty: ${specialty}  
      🔹 Qualifications: ${qualifications}  
      Best regards,  
      Healthcare Team
    `);

    return res.status(200).json({
      success: true,
      msg: 'Upgrade successful and email sent',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      doctor: { _id: doctor._id, specialty: doctor.specialty, qualifications: doctor.qualifications, profileImage }
    });
  } catch (err) {
    console.error("Upgrade error:", err);
    return res.status(500).json({ success: false, msg: 'Server error during upgrade', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId } = req.params;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, msg: "Invalid user ID format" });
    }

    if (req.user.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, msg: "Unauthorized - Only admins can delete users" });
    }

    if (userId === req.user.id) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, msg: "Cannot delete your own account" });
    }

    const userToDelete = await User.findById(userId).session(session);
    if (!userToDelete) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (userToDelete.role === "admin") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, msg: "Unauthorized - Admin accounts cannot be deleted" });
    }

    if (userToDelete.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: userToDelete._id }).session(session);
      if (doctor?.profileImage) {
        const publicId = doctor.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`doctor_profiles/${publicId}`);
      }
      await Doctor.deleteOne({ userId: userToDelete._id }).session(session);
    }
    
    // Delete all appointments related to this user
    await Appointment.deleteMany({
      $or: [
        { patientId: userToDelete._id },
        { doctorId: userToDelete.doctorProfile }
      ]
    }).session(session);

    await User.deleteOne({ _id: userToDelete._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, msg: "User and all related data deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Deletion error:", error);
    return res.status(500).json({ success: false, msg: "Server error during deletion", error: error.message });
  }
};