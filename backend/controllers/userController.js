const mongoose = require("mongoose");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../config/email");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body; // Accept 'role' in request

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      await bcrypt.genSalt(10)
    );

    const isAdminPresent = await User.findOne({ role: "admin" });

    const assignedRole = isAdminPresent
      ? "patient"
      : role === "admin"
      ? "admin"
      : "patient";

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
    });

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

// User Login
exports.login = async (req, res) => {
  try {
    // Ensure email is a string
    const email = String(req.body.email).trim();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

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
    let query = User.findById(req.userId).select("-password"); // ✅ Fixed

    if (req.userRole === "doctor") {
      query = query.populate(
        "doctorProfile",
        "name specialty qualifications profileImage availableSlots"
      );
    }

    const user = await query;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
      .populate(
        "doctorProfile",
        "specialty qualifications profileImage availableSlots"
      );

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
    // Ensure only an admin can perform this action
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Unauthorized' });

    const { userId, specialty, qualifications, profileImage } = req.body;
    
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.role === 'doctor') return res.status(400).json({ msg: 'Already a doctor' });

    // Create a new doctor profile
    const doctor = await new Doctor({
      userId: user._id,
      specialty: specialty || 'General',
      qualifications: qualifications || 'MBBS',
      profileImage: profileImage || ''
    }).save();

    // Update user role and link to doctor profile
    user.role = 'doctor';
    user.doctorProfile = doctor._id;
    await user.save();

    // Send upgrade email with instructions
    await sendEmail(
      user.email,
      'Account Upgraded - Welcome to the Doctor Portal!',
      `Dear ${user.name},

Congratulations! Your account has been successfully upgraded, and you are now registered as a doctor.

🔹 **Specialty:** ${doctor.specialty}

You can now log in to the system and access your doctor dashboard. To complete your profile:
1️⃣ Log in using your registered email.  
2️⃣ Navigate to the **Doctor Dashboard**.  
3️⃣ Upload your profile image and set your availability.

👉 **[Insert Login URL Here]** 👈

If you have any questions, feel free to contact our support team.

Best regards,  
**Emmanuel Team**`
    );

    res.json({ msg: 'Upgrade successful', user, doctor });
  } catch (err) {
    console.error("❌ Upgrade error:", err);
    res.status(500).send('Server error');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    console.log("🔹 DELETE request received for ID:", req.params.userId);

    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid user ID format" });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (deletedUser.role === "doctor") {
      await Doctor.findOneAndDelete({ userId: deletedUser._id });
    }

    console.log("✅ User deleted successfully:", deletedUser);
    res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Deletion error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
