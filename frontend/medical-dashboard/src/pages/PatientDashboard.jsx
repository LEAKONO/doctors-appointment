import { useEffect, useState, useCallback } from "react";
import { FiSearch, FiCalendar, FiUser, FiAward, FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, SkeletonCard } from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const FullPageLoader = () => (
  <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
    <Sidebar role="patient" />
    <main className="flex-1 p-8 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size={12} />
        <p className="text-gray-600 mt-4">Loading your dashboard...</p>
      </div>
    </main>
  </div>
);

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(null);
  const [deletingAppointment, setDeletingAppointment] = useState(null);
  const { user, isInitializing } = useAuth();
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [appointmentImagesLoaded, setAppointmentImagesLoaded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDoctors = useCallback(async () => {
    try {
      const { data } = await api.get("/doctors/all-doctors");
      
      const doctorsData = Array.isArray(data?.doctors) ? data.doctors : 
                         Array.isArray(data?.data) ? data.data : 
                         Array.isArray(data) ? data : [];
      
      return doctorsData.map(doctor => ({
        ...doctor,
        userId: doctor.userId || {},
        name: doctor.name || doctor.userId?.name || "Unknown Doctor",
        specialty: doctor.specialty || "General Practitioner",
        profileImage: doctor.profileImage || '/default-profile.jpg',
        availableSlots: doctor.availableSlots || []
      }));
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      toast.error("Failed to load doctors");
      return []; 
    }
  }, []);

  const fetchAppointments = useCallback(async (doctorsList) => {
    try {
      const response = await api.get("/appointments/my-appointments");
      
      let appointmentsData = response.data;
      
      if (response.data && !Array.isArray(response.data) && response.data.data) {
        appointmentsData = response.data.data;
      }
      
      if (!Array.isArray(appointmentsData)) {
        throw new Error("Invalid appointments data format");
      }
  
      return appointmentsData.map(appointment => {
        const doctor = doctorsList.find(d => 
          d._id === appointment.doctorId?._id || 
          d._id === appointment.doctorId
        );
        
        return {
          ...appointment,
          date: new Date(appointment.date),
          doctorId: doctor ? {
            ...doctor,
            userId: {
              _id: doctor?.userId?._id || doctor?.userId || "unknown",
              name: doctor?.name || doctor?.userId?.name || "Unknown Doctor",
              specialty: doctor?.specialty || "General Practitioner"
            },
            profileImage: doctor?.profileImage || '/default-profile.jpg'
          } : null
        };
      });
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      toast.error("Failed to load appointments");
      return [];
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const doctorsList = await fetchDoctors();
      const appointmentsList = await fetchAppointments(doctorsList);
      
      setDoctors(doctorsList);
      setAppointments(appointmentsList);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(
        err.response?.data?.message || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchDoctors, fetchAppointments]);

  useEffect(() => {
    if (!isInitializing) {
      fetchData();
    }
  }, [fetchData, isInitializing]);

  const bookAppointment = async (doctorId, slot) => {
    const tempAppointmentId = `temp-${Date.now()}`;
    const doctor = doctors.find(d => d._id === doctorId);
    
    if (!doctor) {
      toast.error("Doctor information is not available");
      return;
    }

    try {
      setBookingLoading(`${doctorId}-${slot}`);
      
      const newAppointment = {
        _id: tempAppointmentId,
        date: new Date(slot),
        status: "pending",
        patientId: {
          _id: user.id,
          name: user.name
        },
        doctorId: {
          _id: doctorId,
          userId: {
            _id: doctor.userId?._id || doctor.userId || "unknown",
            name: doctor.name || doctor.userId?.name || "Unknown Doctor",
            specialty: doctor.specialty || "General Practitioner"
          },
          profileImage: doctor.profileImage || '/default-profile.jpg'
        }
      };

      setAppointments(prev => [...prev, newAppointment]);
      setDoctors(prev => prev.map(d => {
        if (d._id === doctorId) {
          return {
            ...d,
            availableSlots: d.availableSlots.filter(s => s !== slot)
          };
        }
        return d;
      }));

      toast.success(`Appointment booked successfully!`);

      setTimeout(() => {
        const element = document.getElementById('appointments-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          const newAppointmentRow = document.getElementById(`appointment-${tempAppointmentId}`);
          if (newAppointmentRow) {
            newAppointmentRow.classList.add('bg-blue-50');
            setTimeout(() => {
              newAppointmentRow.classList.remove('bg-blue-50');
            }, 2000);
          }
        }
      }, 100);

      const response = await api.post("/appointments/book", { 
        doctorId, 
        date: slot
      });

      if (response.data?.success) {
        const bookedAppointment = response.data.data;
        setAppointments(prev => prev.map(app => 
          app._id === tempAppointmentId ? {
            ...bookedAppointment,
            date: new Date(bookedAppointment.date),
            doctorId: {
              ...bookedAppointment.doctorId,
              userId: {
                _id: doctor.userId?._id || doctor.userId || "unknown",
                name: doctor.name || doctor.userId?.name || "Unknown Doctor",
                specialty: doctor.specialty || "General Practitioner"
              },
              profileImage: doctor.profileImage || '/default-profile.jpg'
            }
          } : app
        ));
      }

    } catch (err) {
      console.error("Booking error:", err);
      
      setAppointments(prev => prev.filter(app => app._id !== tempAppointmentId));
      setDoctors(prev => prev.map(d => {
        if (d._id === doctorId) {
          return {
            ...d,
            availableSlots: [...(d.availableSlots || []), slot].sort()
          };
        }
        return d;
      }));

      toast.error(
        err.response?.data?.msg || err.message || "Failed to book appointment"
      );
    } finally {
      setBookingLoading(null);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      setDeletingAppointment(appointmentId);
      
      setAppointments(prev => prev.filter(app => app._id !== appointmentId));

      toast.success('Appointment deleted successfully');

      await api.delete(`/appointments/cancel/${appointmentId}`);

    } catch (err) {
      console.error("Deletion error:", err);
      
      await fetchData();

      toast.error(
        err.response?.data?.msg || err.message || "Failed to delete appointment"
      );
    } finally {
      setDeletingAppointment(null);
    }
  };

  const handleImageLoad = (doctorId) => {
    setImagesLoaded(prev => ({...prev, [doctorId]: true}));
  };

  const handleAppointmentImageLoad = (appointmentId) => {
    setAppointmentImagesLoaded(prev => ({...prev, [appointmentId]: true}));
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isInitializing) {
    return <FullPageLoader />;
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Sidebar role="patient" />
        <main className="flex-1 p-4 md:p-8 fade-in overflow-x-hidden">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
          
          <section className="mb-12">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>

          <section>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar role="patient" />
      <main className="flex-1 p-4 md:p-8 relative fade-in overflow-x-hidden">
        <div className="mb-6 md:mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-gray-800 mb-1"
          >
            Welcome back, <span className="text-blue-600">{user?.name || 'Patient'}</span>
          </motion.h1>
          <p className="text-gray-600 text-sm md:text-base">
            Here's what's happening with your appointments
          </p>
        </div>

        {/* Search Bar Section */}
        <div className="mb-6 md:mb-8">
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 text-lg" />
            </div>
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
              className="block w-full pl-10 pr-3 py-2 md:py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <section className="mb-10 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              Available Doctors
            </h2>
            <span className="text-xs md:text-sm text-gray-500">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
            </span>
          </div>
          
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredDoctors.map((doctor) => (
                <motion.div 
                  key={doctor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex items-center mb-3 md:mb-4">
                      <div className="relative w-12 h-12 md:w-16 md:h-16 mr-3 md:mr-4">
                        {!imagesLoaded[doctor._id] && (
                          <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse"></div>
                        )}
                        <img
                          src={doctor.profileImage}
                          alt={doctor.name}
                          className={`w-full h-full rounded-full object-cover border-2 border-white shadow-sm ${
                            !imagesLoaded[doctor._id] ? 'opacity-0' : 'opacity-100'
                          }`}
                          onLoad={() => handleImageLoad(doctor._id)}
                          onError={(e) => {
                            e.target.src = "/default-profile.jpg";
                            handleImageLoad(doctor._id);
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-bold text-gray-800">{doctor.name}</h3>
                        <p className="text-blue-600 font-medium text-sm md:text-base">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>

                    {doctor.qualifications && (
                      <div className="flex items-center text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                        <FiAward className="mr-2 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{doctor.qualifications}</span>
                      </div>
                    )}

                    <div className="mb-0 md:mb-2">
                      <h4 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <FiCalendar className="mr-2 text-blue-500 flex-shrink-0" />
                        Available Slots
                      </h4>
                      <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {doctor.availableSlots?.length > 0 ? (
                          doctor.availableSlots.map((slot, index) => {
                            const slotKey = `${doctor._id}-${slot}`;
                            const isBooking = bookingLoading === slotKey;
                            return (
                              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                <span className="text-xs md:text-sm text-gray-700">
                                  {new Date(slot).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <button
                                  className={`py-1 px-2 md:px-3 rounded-lg transition duration-200 text-xs md:text-sm font-medium ${
                                    isBooking 
                                      ? 'bg-blue-400 text-white cursor-not-allowed' 
                                      : 'bg-blue-500 text-white hover:bg-blue-600'
                                  } shadow-sm whitespace-nowrap`}
                                  onClick={() => bookAppointment(doctor._id, slot)}
                                  disabled={isBooking || bookingLoading}
                                >
                                  {isBooking ? 'Booking...' : 'Book Now'}
                                </button>
                              </li>
                            );
                          })
                        ) : (
                          <li className="text-xs md:text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                            No available slots
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 md:py-12 bg-white rounded-xl shadow-sm"
            >
              <FiSearch className="mx-auto text-3xl md:text-4xl text-gray-400 mb-3 md:mb-4" />
              <p className="text-gray-500 text-base md:text-lg">
                {searchTerm ? 
                  `No doctors found matching "${searchTerm}"` : 
                  'No doctors available at the moment'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-3 md:mt-4 text-blue-500 hover:text-blue-700 font-medium text-sm md:text-base"
                >
                  Clear search
                </button>
              )}
            </motion.div>
          )}
        </section>

        <section id="appointments-section" className="mb-10 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              My Appointments
            </h2>
            <span className="text-xs md:text-sm text-gray-500">
              {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'} total
            </span>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiUser className="mr-1 md:mr-2" />
                        <span className="whitespace-nowrap">Doctor</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1 md:mr-2" />
                        <span className="whitespace-nowrap">Date & Time</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <motion.tr 
                        key={appointment._id} 
                        id={`appointment-${appointment._id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 relative">
                              {appointment.doctorId ? (
                                <>
                                  {!appointmentImagesLoaded[appointment._id] && (
                                    <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse"></div>
                                  )}
                                  <img 
                                    className={`h-8 w-8 md:h-10 md:w-10 rounded-full object-cover ${
                                      !appointmentImagesLoaded[appointment._id] ? 'opacity-0' : 'opacity-100'
                                    }`}
                                    src={appointment.doctorId?.profileImage || '/default-profile.jpg'} 
                                    alt={appointment.doctorId?.name || appointment.doctorId?.userId?.name}
                                    onLoad={() => handleAppointmentImageLoad(appointment._id)}
                                    onError={(e) => {
                                      e.target.src = "/default-profile.jpg";
                                      handleAppointmentImageLoad(appointment._id);
                                    }}
                                  />
                                </>
                              ) : (
                                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <FiUser className="text-gray-400 text-sm md:text-base" />
                                </div>
                              )}
                            </div>
                            <div className="ml-2 md:ml-4">
                              <div className="text-xs md:text-sm font-medium text-gray-900 flex items-center">
                                {!appointment.doctorId && (
                                  <FiAlertTriangle className="text-yellow-500 mr-1 text-xs md:text-sm" />
                                )}
                                {appointment.doctorId?.name || 
                                 appointment.doctorId?.userId?.name || 
                                 "Doctor Deleted"}
                              </div>
                              <div className="text-xs md:text-sm text-gray-500">
                                {appointment.doctorId?.specialty || 
                                 appointment.doctorId?.userId?.specialty || 
                                 "Specialty not available"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                          <div className="text-xs md:text-sm text-gray-900">
                            {new Date(appointment.date).toLocaleDateString([], {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs md:text-sm text-gray-500">
                            {new Date(appointment.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-4 md:leading-5 font-semibold rounded-full ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : appointment.status === 'cancelled' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                          {appointment.status !== 'cancelled' && (
                            <button
                              onClick={() => cancelAppointment(appointment._id)}
                              disabled={deletingAppointment === appointment._id}
                              className={`flex items-center space-x-1 px-2 py-1 md:px-3 md:py-1 rounded-lg transition duration-200 ${
                                deletingAppointment === appointment._id
                                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                              }`}
                            >
                              <FiTrash2 className="text-xs md:text-sm" />
                              <span>{deletingAppointment === appointment._id ? 'Cancelling...' : 'Cancel'}</span>
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 md:py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FiCalendar className="text-3xl md:text-4xl text-gray-400 mb-3 md:mb-4" />
                          <p className="text-gray-500 text-base md:text-lg">
                            No appointments scheduled yet
                          </p>
                          <p className="text-gray-400 mt-1 text-sm md:text-base">
                            Book your first appointment with a doctor above
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PatientDashboard;