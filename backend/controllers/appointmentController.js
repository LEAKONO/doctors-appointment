const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../config/email');

exports.bookAppointment = async (req, res) => {
    const { doctorId, date } = req.body;

    try {
        // Validate input
        if (!doctorId || !date) {
            return res.status(400).json({ 
                success: false,
                msg: 'Doctor ID and date are required' 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid doctor ID format'
            });
        }

        const appointmentDate = new Date(date);
        if (isNaN(appointmentDate.getTime())) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid date format'
            });
        }

        // Add buffer to prevent booking appointments too close to current time
        const minimumBookingTime = new Date();
        minimumBookingTime.setMinutes(minimumBookingTime.getMinutes() + 30);
        
        if (appointmentDate < minimumBookingTime) {
            return res.status(400).json({
                success: false,
                msg: 'Appointments must be booked at least 30 minutes in advance'
            });
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
                return res.status(400).json({
                    success: false,
                    msg: 'Slot not available or doctor not found'
                });
            }

            const existingAppointment = await Appointment.findOne({
                doctorId,
                date,
                status: { $in: ['pending', 'confirmed'] }
            }).session(session);

            if (existingAppointment) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    msg: 'This slot is already booked'
                });
            }

            const appointment = new Appointment({
                patientId: req.userId,
                doctorId,
                date: appointmentDate
            });

            await appointment.save({ session });

            await Doctor.findByIdAndUpdate(
                doctorId,
                { $pull: { availableSlots: date } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            // Send email notification in background
            const patient = await User.findById(req.userId).select('name email');
            if (patient) {
                sendEmail(
                    patient.email,
                    "Appointment Confirmation",
                    `Dear ${patient.name},\n\nYour appointment with Dr. ${doctor.userId.name} on ${appointmentDate.toLocaleString()} has been confirmed.\n\nThank you!`
                ).catch(console.error);
            }

            // Create notification in background
            Notification.create({
                userId: doctor.userId._id,
                message: `New appointment request from ${patient.name}`,
                type: 'appointment',
                relatedId: appointment._id
            }).catch(console.error);

            return res.status(201).json({
                success: true,
                data: {
                    _id: appointment._id,
                    date: appointment.date,
                    status: appointment.status,
                    doctorId: {
                        _id: doctor._id,
                        userId: {
                            _id: doctor.userId._id,
                            name: doctor.userId.name,
                            profileImage: doctor.userId.profileImage
                        }
                    },
                    patientId: {
                        _id: patient._id,
                        name: patient.name
                    }
                }
            });

        } catch (transactionError) {
            await session.abortTransaction();
            session.endSession();
            console.error("Transaction error:", transactionError);
            throw transactionError;
        }

    } catch (err) {
        console.error("Appointment booking error:", {
            error: err.message,
            stack: err.stack,
            requestBody: req.body,
            userId: req.userId
        });

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
                populate: {
                    path: 'userId',
                    select: 'name profileImage'
                }
            })
            .populate('patientId', 'name')
            .sort({ date: -1 });

        res.json({
            success: true,
            data: appointments.map(appointment => ({
                _id: appointment._id,
                date: appointment.date,
                status: appointment.status,
                doctorId: {
                    _id: appointment.doctorId._id,
                    userId: {
                        _id: appointment.doctorId.userId._id,
                        name: appointment.doctorId.userId.name,
                        profileImage: appointment.doctorId.userId.profileImage
                    }
                },
                patientId: {
                    _id: appointment.patientId._id,
                    name: appointment.patientId.name
                }
            }))
        });
    } catch (err) {
        console.error("Failed to fetch appointments:", err);
        res.status(500).json({
            success: false,
            msg: 'Failed to fetch appointments',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};