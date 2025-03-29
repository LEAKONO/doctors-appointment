const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true,
    validate: {
      validator: async function(value) {
        if (this.isNew) return true;
        
        const user = await mongoose.model('User').findOne({
          _id: value,
          isDeleted: { $ne: true }
        });
        return user && user.role === 'doctor';
      },
      message: 'User must exist, not be deleted, and have doctor role'
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
    required: true,
    default: 'MBBS',
    trim: true
  },
  profileImage: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        if (!value) return true; // Empty is allowed
        // Allow both local paths and Cloudinary URLs
        return value.startsWith('/uploads/') || 
               value.includes('res.cloudinary.com');
      },
      message: 'Profile image must be an uploaded file path or Cloudinary URL'
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
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// [Keep all existing virtuals, methods, and statics exactly as they were]

// Remove the duplicate index definition for userId
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ availableSlots: 1 });
doctorSchema.index({ isDeleted: 1 });
doctorSchema.index({ deletedAt: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;