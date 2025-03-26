const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true,
    validate: {
      validator: async function(value) {
        const user = await mongoose.model('User').findById(value);
        return user && user.role === 'doctor';
      },
      message: 'User must exist and have doctor role'
    }
  },
  specialty: { 
    type: String, 
    required: true,
    default: 'General Practitioner',
    trim: true
  },
  qualifications: { 
    type: String,
    default: 'MBBS',
    trim: true
  },
  profileImage: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        return !value || value.startsWith('/uploads/');
      },
      message: 'Profile image must be an uploaded file path'
    }
  },
  availableSlots: [{ 
    type: Date,
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Available slots must be future dates'
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual for doctor's name
doctorSchema.virtual('name').get(function() {
  return this.userId?.name || 'Dr. Unknown';
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;