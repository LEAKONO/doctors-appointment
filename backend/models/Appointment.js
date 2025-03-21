const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
});

module.exports = mongoose.model('Appointment', appointmentSchema);