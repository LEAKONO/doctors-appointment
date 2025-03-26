const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

console.log(Doctor);
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../config/email');

exports.bookAppointment = async (req, res) => {
    const { doctorId, date } = req.body;

    try {
        if (!doctorId || !date) {
            return res.status(400).json({ msg: 'Doctor ID and date are required' });
        }

        const appointmentDate = new Date(date);
        if (appointmentDate < new Date()) {
            return res.status(400).json({ msg: 'Cannot book appointments in the past' });
        }

        const isoDate = appointmentDate.toISOString();

        const doctor = await Doctor.findOneAndUpdate(
            { _id: doctorId, availableSlots: isoDate },
            { $pull: { availableSlots: isoDate } },
            { new: true }
        ).populate('userId', 'name email');

        if (!doctor) {
            return res.status(400).json({ msg: 'Slot not available or doctor not found' });
        }

        const appointment = new Appointment({
            patientId: req.userId,
            doctorId,
            date: appointmentDate
        });

        await appointment.save();

        await Notification.create({
            userId: doctor.userId._id,
            message: `New appointment request from patient ID: ${req.userId}`
        });

        const patient = await User.findById(req.userId).select('name email');
        if (!patient) return res.status(404).json({ msg: 'Patient not found' });

        await sendEmail(
            patient.email,
            "Appointment Confirmation",
            `Dear ${patient.name},\n\nYour appointment with Dr. ${doctor.userId.name} on ${appointment.date} has been confirmed.\n\nThank you for booking with us!`
        );

        res.status(201).json(appointment);
    } catch (err) {
        console.error("❌ Error in booking appointment:", err);
        res.status(500).send('Server error');
    }
};

exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.userId })
            .populate({
                path: 'doctorId',
                populate: {
                    path: 'userId',
                    select: 'name email' 
                }
            })
            .populate('patientId', 'name');

        res.json(appointments);
    } catch (err) {
        console.error("❌ getMyAppointments Error:", err);
        res.status(500).send('Server error');
    }
};
