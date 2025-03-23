const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../config/email');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body; // Accept 'role' in request

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const isAdminPresent = await User.findOne({ role: 'admin' });

    // Only allow 'admin' role if no admin exists
    const assignedRole = isAdminPresent ? 'patient' : role === 'admin' ? 'admin' : 'patient';

    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: assignedRole
    });

    await user.save();
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, userId: user.id, role: user.role });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).send('Server error');
  }
};


// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, userId: user.id, role: user.role });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).send('Server error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('doctorProfile', 'specialty qualifications profileImage availableSlots');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Unauthorized' });
    
    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter)
      .select('-password')
      .populate('doctorProfile', 'specialty qualifications profileImage availableSlots');

    res.json(users);
  } catch (err) {
    console.error("❌ User fetch error:", err);
    res.status(500).send('Server error');
  }
};

exports.upgradeToDoctor = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Unauthorized' });

    const { userId, specialty, qualifications, profileImage } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.role === 'doctor') return res.status(400).json({ msg: 'Already a doctor' });

    const doctor = await new Doctor({
      userId: user._id,
      specialty: specialty || 'General',
      qualifications: qualifications || 'MBBS',
      profileImage: profileImage || ''
    }).save();

    user.role = 'doctor';
    user.doctorProfile = doctor._id;
    await user.save();

    await sendEmail(
      user.email,
      'Account Upgraded',
      `You're now a doctor! Specialty: ${doctor.specialty}`
    );

    res.json({ msg: 'Upgrade successful', user, doctor });
  } catch (err) {
    console.error("❌ Upgrade error:", err);
    res.status(500).send('Server error');
  }
};

// Delete User (Admin Only)
// Delete User (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    console.log("🔹 DELETE request received for ID:", req.params.userId);
    
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (deletedUser.role === 'doctor') {
      await Doctor.findOneAndDelete({ userId: deletedUser._id });
    }

    console.log("✅ User deleted successfully:", deletedUser);
    res.status(200).json({ msg: 'User deleted successfully' });
  } catch (error) {
    console.error("❌ Deletion error:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};