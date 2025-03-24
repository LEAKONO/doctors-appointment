import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../api/axios';

const BookingForm = ({ doctorId }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Fetch available slots on component mount or when doctorId changes
  useEffect(() => {
    if (doctorId) {
      fetchSlots();
    }
  }, [doctorId]);

  const fetchSlots = async () => {
    try {
      const { data } = await api.get(`/doctors/${doctorId}`);
      // Make sure the slots are in Date object format
      setAvailableSlots(data.availableSlots.map(slot => new Date(slot)));
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      alert('Please select a valid date and time.');
      return;
    }

    try {
      await api.post('/appointments/book', { doctorId, date: selectedDate });
      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Select Appointment Slot</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          showTimeSelect
          dateFormat="Pp"
          minDate={new Date()} 
          includeDates={availableSlots} 
          inline
        />
      </div>
      <button type="submit" className="btn-primary w-full">
        Book Appointment
      </button>
    </form>
  );
};

export default BookingForm;
