const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialty: { type: String, required: true },
  qualifications: { type: String, required: true },
  profileImage: { type: String },
  availableSlots: [{ type: Date }],
});

module.exports = mongoose.model('Doctor', doctorSchema);