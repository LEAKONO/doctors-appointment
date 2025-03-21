const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.setAvailability = async (req, res) => {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ msg: 'Only doctors can set availability' });
    }
  
    const { availableSlots } = req.body;
  
    try {
      if (!Array.isArray(availableSlots)) {
        return res.status(400).json({ msg: 'Available slots must be an array' });
      }
  
      const validSlots = availableSlots
        .map(slot => new Date(slot))
        .filter(date => !isNaN(date) && date > new Date())
        .map(date => date.toISOString());
  
      const doctor = await Doctor.findOneAndUpdate(
        { userId: req.user.userId },
        { availableSlots: validSlots },
        { new: true, runValidators: true }
      );
  
      if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });
  
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
exports.getAllDoctors = async (req, res) => {
    try {
      const { specialty } = req.query;
      const query = specialty ? { specialty: { $regex: specialty, $options: 'i' } } : {};
      const doctors = await Doctor.find(query).populate('userId', 'name email');
      res.json(doctors);
    } catch (err) {
      console.error("❌ Error in getAllDoctors:", err);
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