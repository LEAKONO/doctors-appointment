const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

dotenv.config();
const cors = require('cors');

console.log("🔍 Loaded Environment Variables:");
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("PORT:", process.env.PORT);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);

connectDB();

const app = express();  // ✅ Now app is initialized before use
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
