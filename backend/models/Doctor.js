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

// Virtual for doctor's name
doctorSchema.virtual('name', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  get: function() {
    return this._name || (this.userId?.name || 'Dr. Unknown');
  }
});

// Soft delete method
doctorSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
  
  // Optionally cascade to related data
  await mongoose.model('Appointment').updateMany(
    { doctorId: this._id },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  );
  
  return this;
};

// Restore method
doctorSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = null;
  await this.save();
  
  // Optionally restore related data
  await mongoose.model('Appointment').updateMany(
    { doctorId: this._id },
    { $set: { isDeleted: false, deletedAt: null } }
  );
  
  return this;
};

// Modify remove hook to use soft delete
doctorSchema.pre('remove', async function(next) {
  if (this.isDeleted) {
    // If already marked as deleted, proceed with hard delete
    return next();
  }
  
  // Otherwise, perform soft delete instead
  try {
    await this.softDelete();
    // Prevent the actual removal
    throw new Error('Document was soft deleted instead of removed');
  } catch (err) {
    next(new Error('Use softDelete() method instead of remove()'));
  }
});

// Query helpers for soft deletion
doctorSchema.query.notDeleted = function() {
  return this.where({ isDeleted: { $ne: true } });
};

doctorSchema.query.deleted = function() {
  return this.where({ isDeleted: true });
};

// Static method to find active doctors by specialty
doctorSchema.statics.findBySpecialty = function(specialty) {
  return this.find({ 
    specialty: new RegExp(specialty, 'i'),
    isDeleted: { $ne: true }
  });
};

// Static method to find all doctors (including deleted)
doctorSchema.statics.findAll = function() {
  return this.find();
};

doctorSchema.methods.addAvailableSlots = function(slots) {
  if (this.isDeleted) {
    throw new Error('Cannot add slots to a deleted doctor');
  }
  
  const validSlots = slots
    .filter(slot => new Date(slot) > new Date())
    .map(slot => new Date(slot).toISOString());
    
  this.availableSlots = [...new Set([...this.availableSlots, ...validSlots])];
  return this.save();
};

doctorSchema.index({ userId: 1 }, { unique: true });
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ availableSlots: 1 });
doctorSchema.index({ isDeleted: 1 });
doctorSchema.index({ deletedAt: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;