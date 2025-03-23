  const Appointment = require('../models/Appointment');
  const Doctor = require('../models/Doctor');
  const Notification = require('../models/Notification');
  const sendEmail = require('../config/email');


  exports.bookAppointment = async (req, res) => {
    const { doctorId, date } = req.body;

    try {
        if (!doctorId || !date) {
            return res.status(400).json({ msg: 'Doctor ID and date are required' });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

        const appointmentDate = new Date(date);
        if (appointmentDate < new Date()) {
            return res.status(400).json({ msg: 'Cannot book appointments in the past' });
        }

        const isoDate = appointmentDate.toISOString();
        const isSlotAvailable = doctor.availableSlots.some(slot =>
            new Date(slot).toISOString() === isoDate
        );

        if (!isSlotAvailable) {
            return res.status(400).json({ msg: 'Slot not available' });
        }

        const appointment = new Appointment({
            patientId: req.userId,
            doctorId,
            date: appointmentDate
        });

        doctor.availableSlots = doctor.availableSlots.filter(slot =>
            new Date(slot).toISOString() !== isoDate
        );

        await Promise.all([
            appointment.save(),
            doctor.save()
        ]);

        await Notification.create({
            userId: doctor.userId,
            message: `New appointment request from ${req.userId}`
        });

        const patient = await req.user; 

        const emailSubject = "Appointment Confirmation";
        const emailText = `Dear ${patient.name},\n\nYour appointment with Dr. ${doctor.name} on ${appointment.date} has been confirmed.\n\nThank you for booking with us!`;

        await sendEmail(patient.email, emailSubject, emailText);

        res.status(201).json(appointment);

    } catch (err) {
        console.error("❌ Error in booking appointment:", err);
        res.status(500).send('Server error');
    }
};

  exports.getMyAppointments = async (req, res) => {
    try {
      const appointments = await Appointment.find({ patientId: req.userId }).populate('doctorId', 'specialty qualifications');
      res.json(appointments);
    } catch (err) {
      res.status(500).send('Server error');
    }
  };