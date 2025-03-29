import { useEffect, useState, useCallback } from "react";
import { FiSearch, FiCalendar, FiUser, FiAward, FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, SkeletonCard } from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";

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
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success"
  });
  const [searchTerm, setSearchTerm] = useState("");

  const showNotification = useCallback((message, type = "success") => {
    setNotification({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const doctorsRes = await api.get("/doctors/all-doctors");
      return doctorsRes.data.map(doctor => ({
        ...doctor,
        userId: doctor.userId || {},
        name: doctor.name || "Unknown Doctor",
        specialty: doctor.specialty || "General Practitioner",
        profileImage: doctor.profileImage 
          ? doctor.profileImage.startsWith('http') 
            ? doctor.profileImage 
            : `${window.location.origin}${doctor.profileImage}`
          : '/default-profile.jpg',
        availableSlots: doctor.availableSlots?.map(slot => 
          new Date(slot).toISOString()
        ) || []
      }));
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      showNotification("Failed to load doctors", "error");
      return [];
    }
  }, [showNotification]);

  const fetchAppointments = useCallback(async (doctorsList) => {
    try {
      const response = await api.get("/appointments/my-appointments");
      
      if (!response.data || !response.data.success || !Array.isArray(response.data.data)) {
        throw new Error("Invalid appointments data structure");
      }

      return response.data.data.map(appointment => {
        const doctor = doctorsList.find(d => 
          d._id === appointment.doctorId?._id
        );
        
        return {
          ...appointment,
          date: new Date(appointment.date),
          doctorId: doctor ? {
            ...appointment.doctorId,
            userId: {
              _id: doctor?.userId?._id || doctor?.userId || "unknown",
              name: doctor?.name || "Unknown Doctor",
              specialty: doctor?.specialty || "General Practitioner"
            },
            profileImage: doctor?.profileImage || '/default-profile.jpg'
          } : null
        };
      });
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      showNotification("Failed to load appointments", "error");
      return [];
    }
  }, [showNotification]);

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
      showNotification(
        err.response?.data?.message || "Failed to load dashboard data",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, showNotification, fetchDoctors, fetchAppointments]);

  useEffect(() => {
    if (!isInitializing) {
      fetchData();
    }
  }, [fetchData, isInitializing]);

  const bookAppointment = async (doctorId, slot) => {
    const tempAppointmentId = `temp-${Date.now()}`;
    const doctor = doctors.find(d => d._id === doctorId);
    
    if (!doctor) {
      showNotification("Doctor information is not available", "error");
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
            name: doctor.name || "Unknown Doctor",
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

      showNotification(`Appointment booked successfully!`);

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
                name: doctor.name || "Unknown Doctor",
                specialty: doctor.specialty || "General Practitioner"
              },
              profileImage: doctor.profileImage || '/default-profile.jpg'
            }
          } : app
        ));
      }

    } catch (err) {
      console.error("Booking error:", err);
      
      // Rollback optimistic update
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

      showNotification(
        err.response?.data?.msg || err.message || "Failed to book appointment",
        "error"
      );
    } finally {
      setBookingLoading(null);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      setDeletingAppointment(appointmentId);
      
      // Optimistic update - remove the appointment completely
      setAppointments(prev => prev.filter(app => app._id !== appointmentId));

      showNotification('Appointment deleted successfully');

      // Make API call to delete
      await api.delete(`/appointments/cancel/${appointmentId}`);

      // No need to refresh data since we did optimistic update
      
    } catch (err) {
      console.error("Deletion error:", err);
      
      // Rollback optimistic update by refreshing data
      await fetchData();

      showNotification(
        err.response?.data?.msg || err.message || "Failed to delete appointment",
        "error"
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
        <main className="flex-1 p-8 fade-in">
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
      <main className="flex-1 p-8 relative fade-in">
        {notification.show && (
          <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transform transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border-l-4 border-green-500' 
              : 'bg-red-100 text-red-800 border-l-4 border-red-500'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">{notification.message}</span>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Welcome back, {user?.name || 'Patient'}</h1>
          <p className="text-gray-600">Here's what's happening with your appointments</p>
        </div>

        {/* Search Bar Section */}
        <div className="mb-8">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 text-lg" />
            </div>
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Available Doctors</h2>
            <span className="text-sm text-gray-500">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
            </span>
          </div>
          
          {filteredDoctors.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="relative w-16 h-16 mr-4">
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
                        <h3 className="text-lg font-bold text-gray-800">{doctor.name}</h3>
                        <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                      </div>
                    </div>

                    {doctor.qualifications && (
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <FiAward className="mr-2 text-blue-500" />
                        <span>{doctor.qualifications}</span>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <FiCalendar className="mr-2 text-blue-500" />
                        Available Slots
                      </h4>
                      <ul className="space-y-2">
                        {doctor.availableSlots?.length > 0 ? (
                          doctor.availableSlots.map((slot, index) => {
                            const slotKey = `${doctor._id}-${slot}`;
                            const isBooking = bookingLoading === slotKey;
                            return (
                              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                <span className="text-sm text-gray-700">
                                  {new Date(slot).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <button
                                  className={`py-1 px-3 rounded-lg transition duration-200 text-sm font-medium ${
                                    isBooking 
                                      ? 'bg-blue-400 text-white cursor-not-allowed' 
                                      : 'bg-blue-500 text-white hover:bg-blue-600'
                                  } shadow-sm`}
                                  onClick={() => bookAppointment(doctor._id, slot)}
                                  disabled={isBooking || bookingLoading}
                                >
                                  {isBooking ? 'Booking...' : 'Book Now'}
                                </button>
                              </li>
                            );
                          })
                        ) : (
                          <li className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                            No available slots
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <FiSearch className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? 
                  `No doctors found matching "${searchTerm}"` : 
                  'No doctors available at the moment'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-blue-500 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </section>

        <section id="appointments-section" className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">My Appointments</h2>
            <span className="text-sm text-gray-500">
              {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'} total
            </span>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiUser className="mr-2" />
                        Doctor
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiCalendar className="mr-2" />
                        Date & Time
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <tr 
                        key={appointment._id} 
                        id={`appointment-${appointment._id}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              {appointment.doctorId ? (
                                <>
                                  {!appointmentImagesLoaded[appointment._id] && (
                                    <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse"></div>
                                  )}
                                  <img 
                                    className={`h-10 w-10 rounded-full object-cover ${
                                      !appointmentImagesLoaded[appointment._id] ? 'opacity-0' : 'opacity-100'
                                    }`}
                                    src={appointment.doctorId?.profileImage || '/default-profile.jpg'} 
                                    alt={appointment.doctorId?.userId?.name}
                                    onLoad={() => handleAppointmentImageLoad(appointment._id)}
                                    onError={(e) => {
                                      e.target.src = "/default-profile.jpg";
                                      handleAppointmentImageLoad(appointment._id);
                                    }}
                                  />
                                </>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <FiUser className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {!appointment.doctorId && (
                                  <FiAlertTriangle className="text-yellow-500 mr-1" />
                                )}
                                {appointment.doctorId?.userId?.name || 
                                 appointment.doctorId?.name || 
                                 "Doctor Deleted"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.doctorId?.userId?.specialty || 
                                 appointment.doctorId?.specialty || 
                                 "Specialty not available"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(appointment.date).toLocaleDateString([], {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(appointment.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : appointment.status === 'cancelled' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {appointment.status !== 'cancelled' && (
                            <button
                              onClick={() => cancelAppointment(appointment._id)}
                              disabled={deletingAppointment === appointment._id}
                              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition duration-200 ${
                                deletingAppointment === appointment._id
                                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                              }`}
                            >
                              <FiTrash2 className="text-sm" />
                              <span>{deletingAppointment === appointment._id ? 'Cancelling...' : 'Cancel'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FiCalendar className="text-4xl text-gray-400 mb-4" />
                          <p className="text-gray-500 text-lg">No appointments scheduled yet</p>
                          <p className="text-gray-400 mt-1">Book your first appointment with a doctor above</p>
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