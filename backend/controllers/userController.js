const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: 'User already exists' });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      user = new User({ name, email, password: hashedPassword, role });
      await user.save();
  
      if (role === "doctor") {
        const doctor = new Doctor({
          userId: user._id,
          specialty: req.body.specialty || "General",
          qualifications: req.body.qualifications || "MBBS",
          availableSlots: [],
        });
        await doctor.save();
        console.log("✅ Doctor profile created in `doctors` collection");
      }
  
      const payload = { userId: user.id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(201).json({ token, userId: user.id, role: user.role }); // ✅ Added userId
    } catch (err) {
      console.error("❌ Error in register:", err);
      res.status(500).send('Server error');
    }
  };
  

  exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log("🔍 Login Attempt - Email:", email);
    console.log("🔍 Password from request:", password);
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log("❌ User not found in database");
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      console.log("✅ User found:", user.email);
      console.log("🔍 Stored Hashed Password in DB:", user.password);
  
      if (!password) {
        console.log("❌ No password provided in request!");
        return res.status(400).json({ msg: "Password is required" });
      }
  
      // ✅ Debug bcrypt.compare
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("🔍 Password Match Result:", isMatch);
  
      if (!isMatch) {
        console.log("❌ Password does not match for:", user.email);
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      console.log("✅ Password matched successfully!");
  
      const payload = { userId: user.id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ token, userId: user.id, role: user.role }); // ✅ Added userId
    } catch (err) {
      console.error("❌ Server error in login:", err);
      res.status(500).send('Server error');
    }
};

  

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// 🔹 Admin-only function to upgrade a patient to a doctor
exports.upgradeToDoctor = async (req, res) => {
  const { userId, specialty, qualifications } = req.body;

  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Only admins can perform this action' });
    }

    // Find the user to be upgraded
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Check if the user is already a doctor
    if (user.role === 'doctor') {
      return res.status(400).json({ msg: 'User is already a doctor' });
    }

    // Update the user's role to doctor
    user.role = 'doctor';
    await user.save();

    // Create a corresponding Doctor entry
    const doctor = new Doctor({
      userId: user._id,
      specialty,
      qualifications,
      availableSlots: [],
    });
    await doctor.save();

    res.json({ msg: 'User upgraded to doctor successfully', user });
  } catch (err) {
    console.error("❌ Error in upgradeToDoctor:", err);
    res.status(500).send('Server error');
  }
};