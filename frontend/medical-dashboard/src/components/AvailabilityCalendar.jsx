import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../api/axios";

const AvailabilityCalendar = () => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  const handleDateChange = (date) => {
    setStartDate(date);
    setSelectedTime(date);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  const addTimeSlot = () => {
    if (selectedTime) {
      const newSlot = new Date(selectedTime);
      if (!selectedSlots.some(slot => slot.getTime() === newSlot.getTime())) {
        setSelectedSlots([...selectedSlots, newSlot]);
      }
    }
  };

  const removeSlot = (index) => {
    setSelectedSlots(selectedSlots.filter((_, i) => i !== index));
  };

  const submitAvailability = async () => {
    try {
      await api.post("/doctors/set-availability", {
        availableSlots: selectedSlots.map(date => date.toISOString()),
      });
      alert("Availability updated successfully!");
      setSelectedSlots([]);
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Set Availability</h3>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Date</label>
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            minDate={new Date()}
            inline
            className="border rounded p-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Select Time</label>
          <DatePicker
            selected={selectedTime}
            onChange={handleTimeChange}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            className="border rounded p-2"
          />
          <button
            onClick={addTimeSlot}
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            Add Time Slot
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Selected Time Slots:</h4>
        {selectedSlots.length > 0 ? (
          <ul className="space-y-2">
            {selectedSlots
              .sort((a, b) => a - b)
              .map((slot, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span>
                    {slot.toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button 
                    onClick={() => removeSlot(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No time slots selected</p>
        )}
      </div>

      <button
        onClick={submitAvailability}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
        disabled={selectedSlots.length === 0}
      >
        Save Availability
      </button>
    </div>
  );
};

export default AvailabilityCalendar;