const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  specialty: { 
    type: String, 
    required: true,
    default: 'General'
  },
  qualifications: { 
    type: String,
    default: 'MBBS'
  },
  profileImage: String,
  availableSlots: [{ type: Date }]
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;