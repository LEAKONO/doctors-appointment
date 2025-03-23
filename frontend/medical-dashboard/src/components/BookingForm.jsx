import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../api/axios';

const BookingForm = ({ doctorId }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const fetchSlots = async () => {
    try {
      const { data } = await api.get(`/doctors/${doctorId}`);
      setAvailableSlots(data.availableSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        <label className="block text-sm font-medium mb-1">Available Slots</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          showTimeSelect
          dateFormat="Pp"
          minDate={new Date()}
          includeDates={availableSlots.map(slot => new Date(slot))}
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