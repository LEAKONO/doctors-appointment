import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../api/axios';

const AvailabilityCalendar = () => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  
  const handleSlotSelect = (dates) => {
    const newSlots = dates.map(date => date.toISOString());
    setSelectedSlots(newSlots);
  };

  const submitAvailability = async () => {
    try {
      await api.post('/doctors/set-availability', { availableSlots: selectedSlots });
      alert('Availability updated successfully!');
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Set Availability</h3>
      <DatePicker
        selected={null}
        onChange={handleSlotSelect}
        showTimeSelect
        dateFormat="Pp"
        minDate={new Date()}
        inline
        selectsMultiple
      />
      <button 
        onClick={submitAvailability}
        className="mt-4 btn-primary"
      >
        Save Availability
      </button>
    </div>
  );
};

export default AvailabilityCalendar;