const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.setAvailability = async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ msg: 'Only doctors can set availability' });
  }

  const { availableSlots } = req.body;

  try {
    let doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

    doctor.availableSlots = availableSlots;
    await doctor.save();

    res.json(doctor);
  } catch (err) {
    console.error("❌ Error in setAvailability:", err);
    res.status(500).send('Server error');
  }
};

exports.getAppointments = async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ msg: 'Only doctors can view appointments' });
  }

  try {
    const appointments = await Appointment.find({ doctorId: req.user.userId }).populate('patientId', 'name email');
    res.json(appointments);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ msg: 'Only doctors can update appointment status' });
  }

  const { status } = req.body;
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    res.status(500).send('Server error');
  }
};