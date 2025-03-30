import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const AvailabilityCalendar = () => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const now = new Date();
    const validSlots = selectedSlots.filter(slot => new Date(slot) > now);
    
    if (validSlots.length !== selectedSlots.length) {
      setSelectedSlots(validSlots);
    }
  }, [selectedSlots]);

  const handleDateChange = (date) => {
    setStartDate(date);
    // Reset time when date changes
    setSelectedTime(null);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  const addTimeSlot = () => {
    if (selectedTime) {
      const newSlot = new Date(selectedTime);
      const now = new Date();
      
      // Validate the slot is in the future
      if (newSlot <= now) {
        toast.error("Please select a future time slot");
        return;
      }

      // Check for duplicate slots
      if (!selectedSlots.some(slot => slot.getTime() === newSlot.getTime())) {
        setSelectedSlots([...selectedSlots, newSlot].sort((a, b) => a - b));
        toast.success("Time slot added");
      } else {
        toast.error("This time slot is already selected");
      }
    } else {
      toast.error("Please select a time");
    }
  };

  const removeSlot = (index) => {
    setSelectedSlots(selectedSlots.filter((_, i) => i !== index));
    toast.success("Time slot removed");
  };

  const submitAvailability = async () => {
    if (selectedSlots.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await api.post("/doctors/set-availability", {
        availableSlots: selectedSlots.map(date => date.toISOString()),
      });
      
      toast.success("Availability updated successfully!", {
        icon: '✅',
        style: {
          background: '#f0fdf4',
          color: '#166534',
        }
      });
      setSelectedSlots([]);
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error(error.response?.data?.message || "Failed to update availability");
    } finally {
      setIsSubmitting(false);
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
        
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium mb-1">Select Time</label>
          <DatePicker
            selected={selectedTime}
            onChange={handleTimeChange}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            className="border rounded p-2 w-full"
            placeholderText="Select a time"
          />
          <button
            onClick={addTimeSlot}
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm w-full hover:bg-blue-600 transition"
            disabled={!selectedTime}
          >
            Add Time Slot
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Selected Time Slots:</h4>
        {selectedSlots.length > 0 ? (
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {selectedSlots.map((slot, index) => (
              <li 
                key={index} 
                className="flex justify-between items-center bg-gray-100 p-2 rounded hover:bg-gray-200 transition"
              >
                <span className="font-medium">
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
                  className="text-red-500 hover:text-red-700 text-lg font-bold"
                  title="Remove slot"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No time slots selected</p>
        )}
      </div>

      <button
        onClick={submitAvailability}
        className={`mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300 ${
          selectedSlots.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
        } ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
        disabled={selectedSlots.length === 0 || isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Availability'}
      </button>
    </div>
  );
};

export default AvailabilityCalendar;