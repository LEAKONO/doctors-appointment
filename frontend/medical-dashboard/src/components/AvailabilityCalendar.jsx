import { useState, useEffect } from "react";
import { FiCalendar, FiTrash2, FiClock, FiPlus, FiLoader } from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AvailabilityCalendar = ({ onUpdate }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [newSlot, setNewSlot] = useState(null);
  const [addingSlot, setAddingSlot] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/doctors/availability');
      if (data?.success) {
        setSlots(data.availableSlots);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slot) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    try {
      setDeletingSlot(slot);
      const { data } = await api.delete('/doctors/availability', {
        data: { slot }
      });

      if (data?.success) {
        toast.success('Slot deleted successfully');
        setSlots(data.availableSlots || []);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error(error.response?.data?.message || 'Failed to delete slot');
    } finally {
      setDeletingSlot(null);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot) {
      toast.error('Please select a date and time');
      return;
    }

    try {
      setAddingSlot(true);
      const { data } = await api.post('/doctors/set-availability', {
        availableSlots: [newSlot.toISOString()]
      });

      if (data?.success) {
        toast.success('Slot added successfully');
        setSlots(data.availableSlots || []);
        setNewSlot(null);
        setShowDatePicker(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error(error.response?.data?.message || 'Failed to add slot');
    } finally {
      setAddingSlot(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <FiLoader className="animate-spin text-blue-500 text-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-700 flex items-center">
          <FiClock className="mr-2 text-blue-500" />
          Your Available Slots
        </h3>
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FiPlus className="mr-1" /> {showDatePicker ? 'Cancel' : 'Add Slot'}
        </button>
      </div>

      {showDatePicker && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date and Time
              </label>
              <DatePicker
                selected={newSlot}
                onChange={(date) => setNewSlot(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select date and time"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleAddSlot}
                disabled={!newSlot || addingSlot}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                  addingSlot || !newSlot
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {addingSlot ? (
                  <>
                    <FiLoader className="animate-spin mr-2" /> Adding...
                  </>
                ) : (
                  'Add Slot'
                )}
              </button>
              <button
                onClick={() => {
                  setNewSlot(null);
                  setShowDatePicker(false);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {slots.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-500">No availability slots set yet</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {slots
                .sort((a, b) => new Date(a) - new Date(b))
                .map((slot, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiCalendar className="text-blue-500 mr-2" />
                        <span className="text-gray-700">{formatDate(slot)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteSlot(slot)}
                        disabled={deletingSlot === slot}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                          deletingSlot === slot
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {deletingSlot === slot ? (
                          <>
                            <FiLoader className="animate-spin mr-1" /> Deleting...
                          </>
                        ) : (
                          <>
                            <FiTrash2 className="mr-1" /> Delete
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;