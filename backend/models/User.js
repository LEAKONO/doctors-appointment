const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['patient', 'doctor', 'admin'], 
    default: 'patient' 
  },
  doctorProfile: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }
}, { timestamps: true });

userSchema.pre('remove', async function(next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    await mongoose.model('Appointment').deleteMany({
      $or: [
        { doctor: this._id },
        { patient: this._id }
      ]
    }).session(session);
    
    if (this.role === 'doctor' && this.doctorProfile) {
      await mongoose.model('Doctor').findByIdAndDelete(this.doctorProfile).session(session);
    }
    
    await mongoose.model('Notification').deleteMany({
      $or: [
        { userId: this._id },
        { 'data.userId': this._id }
      ]
    }).session(session);
    
    await session.commitTransaction();
    session.endSession();
    next();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);