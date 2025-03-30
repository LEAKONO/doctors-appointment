const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../config/email');

exports.bookAppointment = async (req, res) => {
  const { doctorId, date } = req.body;

  try {
    if (!doctorId || !date) {
      return res.status(400).json({ success: false, msg: 'Doctor ID and date are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false, msg: 'Invalid doctor ID format' });
    }

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ success: false, msg: 'Invalid date format' });
    }

    const minimumBookingTime = new Date();
    minimumBookingTime.setMinutes(minimumBookingTime.getMinutes() + 30);
    if (appointmentDate < minimumBookingTime) {
      return res.status(400).json({ success: false, msg: 'Appointments must be booked at least 30 minutes in advance' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const doctor = await Doctor.findOne({
        _id: doctorId,
        availableSlots: date
      }).populate('userId', 'name email profileImage').session(session);

      if (!doctor) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, msg: 'Slot not available or doctor not found' });
      }

      const existingAppointment = await Appointment.findOne({
        doctorId,
        date,
        status: { $in: ['pending', 'confirmed'] }
      }).session(session);

      if (existingAppointment) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, msg: 'This slot is already booked' });
      }

      const appointment = new Appointment({
        patientId: req.userId,
        doctorId,
        date: appointmentDate
      });

      await appointment.save({ session });
      await Doctor.findByIdAndUpdate(doctorId, { $pull: { availableSlots: date } }, { session });
      await session.commitTransaction();
      session.endSession();

      const patient = await User.findById(req.userId).select('name email');
      if (patient) {
        sendEmail(
          patient.email,
          "Appointment Confirmation",
          `Dear ${patient.name},\n\nYour appointment with Dr. ${doctor.userId.name} has been confirmed.`
        ).catch(console.error);
      }

      Notification.create({
        userId: doctor.userId._id,
        message: `New appointment request from ${patient.name}`,
        type: 'appointment',
        relatedId: appointment._id
      }).catch(console.error);

      return res.status(201).json({ success: true, data: appointment });

    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction error:", transactionError);
      throw transactionError;
    }
  } catch (err) {
    console.error("Appointment booking error:", err);
    return res.status(500).json({
      success: false,
      msg: 'Failed to book appointment',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.userId })
      .populate({
        path: 'doctorId',
        match: { _id: { $exists: true } },
        populate: {
          path: 'userId',
          select: 'name profileImage',
          match: { _id: { $exists: true } }
        }
      })
      .populate({
        path: 'patientId',
        match: { _id: { $exists: true } },
        select: 'name'
      })
      .sort({ date: -1 });

    const validAppointments = appointments.filter(app => 
      app.doctorId && app.doctorId.userId && app.patientId
    );

    res.json({ success: true, data: validAppointments });
  } catch (err) {
    console.error("Failed to fetch appointments:", err);
    res.status(500).json({
      success: false,
      msg: 'Failed to fetch appointments',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.cancelAppointment = async (req, res) => {
    const { appointmentId } = req.params;
  
    try {
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        return res.status(400).json({ success: false, msg: 'Invalid appointment ID format' });
      }
  
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        const appointment = await Appointment.findOne({
          _id: appointmentId,
          patientId: req.userId,
          status: { $in: ['pending', 'confirmed'] }
        }).session(session);
  
        if (!appointment) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({ success: false, msg: 'Appointment not found or already cancelled' });
        }
  
        if (new Date(appointment.date) > new Date()) {
          await Doctor.findByIdAndUpdate(
            appointment.doctorId,
            { $addToSet: { availableSlots: appointment.date } },
            { session }
          );
        }
  
        await Appointment.deleteOne({ _id: appointmentId }).session(session);
  
        await session.commitTransaction();
        session.endSession();
  
        const patient = await User.findById(req.userId).select('name email');
        const doctor = await Doctor.findById(appointment.doctorId).populate('userId', 'name');
        
        if (patient && doctor?.userId) {
          sendEmail(
            patient.email,
            "Appointment Cancelled",
            `Dear ${patient.name},\n\nYour appointment with Dr. ${doctor.userId.name} has been cancelled.`
          ).catch(console.error);
        }
  
        if (doctor?.userId) {
          Notification.create({
            userId: doctor.userId._id,
            message: `Appointment cancelled by ${patient.name}`,
            type: 'appointment',
            relatedId: appointmentId
          }).catch(console.error);
        }
  
        return res.json({ success: true, msg: 'Appointment deleted successfully' });
  
      } catch (transactionError) {
        await session.abortTransaction();
        session.endSession();
        console.error("Transaction error:", transactionError);
        throw transactionError;
      }
    } catch (err) {
      console.error("Appointment cancellation error:", err);
      return res.status(500).json({
        success: false,
        msg: 'Failed to delete appointment',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
};