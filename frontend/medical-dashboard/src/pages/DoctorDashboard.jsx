import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import ProfileUpload from "../components/ProfileUpload";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { 
  FiCalendar, 
  FiUser, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiLoader, 
  FiMail, 
  FiPhone,
  FiAlertTriangle,
  FiAward,
  FiPlus
} from "react-icons/fi";
import { motion } from "framer-motion";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0
  });

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/doctors/appointments");
      
      const appointmentsData = Array.isArray(response.data?.appointments) 
        ? response.data.appointments 
        : Array.isArray(response.data?.data) 
          ? response.data.data 
          : [];
  
      const processedData = appointmentsData.map(appointment => ({
        _id: appointment._id,
        date: appointment.date,
        status: appointment.status || 'pending',
        patientId: appointment.patientId || { 
          _id: null, 
          name: "Deleted Patient",
          email: "",
          phone: ""
        },
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt
      }));
  
      setAppointments(processedData);
      
      const now = new Date();
      setStats({
        total: processedData.length,
        confirmed: processedData.filter(a => a.status === 'confirmed' && new Date(a.date) >= now).length,
        pending: processedData.filter(a => a.status === 'pending' && new Date(a.date) >= now).length,
        cancelled: processedData.filter(a => a.status === 'cancelled' || new Date(a.date) < now).length
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
      setAppointments([]);
      setStats({
        total: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0
      });
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/doctors/profile");
      if (data?.doctor) {
        const profileImage = data.doctor.profileImage 
          ? `${data.doctor.profileImage}?v=${Date.now()}`
          : null;
        
        updateUserProfile({
          ...user, 
          doctorProfile: {
            ...user.doctorProfile, 
            ...data.doctor,
            profileImage
          }
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAppointments(), fetchProfile()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (appointmentId, status) => {
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
        toast.error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        return;
    }

    try {
        const { data } = await api.put(`/doctors/appointments/${appointmentId}`, { status });

        if (data?.success) {
            setAppointments(prev =>
                prev.map(appointment =>
                    appointment._id === appointmentId ? {
                        ...appointment,
                        status: data.appointment.status
                    } : appointment
                )
            );
            fetchData();
            toast.success(`Appointment ${status}`, {
                icon: status === 'confirmed' ? '✅' :
                      status === 'completed' ? '🎉' :
                      status === 'cancelled' ? '❌' : '🕒',
                style: {
                    background: status === 'confirmed' ? '#f0fdf4' :
                               status === 'completed' ? '#e0f2fe' :
                               status === 'cancelled' ? '#fef2f2' : '#fffbeb',
                    color: status === 'confirmed' ? '#166534' :
                          status === 'completed' ? '#075985' :
                          status === 'cancelled' ? '#991b1b' : '#92400e',
                }
            });
        } else {
            toast.error(data?.message || "Failed to update status");
        }
    } catch (error) {
        console.error("Error updating status:", error);
        toast.error(error.response?.data?.message || "Failed to update appointment status");
    }
  };

  const handleProfileUpdate = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const { data } = await api.post('/doctors/upload-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (data.success) {
        const newImageUrl = data.profileImage ? `${data.profileImage}?v=${Date.now()}` : null;
        
        updateUserProfile({
          ...user,
          doctorProfile: {
            ...user.doctorProfile,
            profileImage: newImageUrl
          }
        });
        
        await fetchProfile();
        toast.success("Profile image updated successfully!");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const getDisplayName = () => {
    if (loading) return "Loading...";
    return `Dr. ${user?.doctorProfile?.name || user?.name || "Unknown"}`;
  };

  const filteredAppointments = appointments.filter(appointment => {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    
    if (activeTab === "upcoming") return appointmentDate >= now;
    if (activeTab === "past") return appointmentDate < now;
    return true;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed':
        return <FiCheckCircle className="text-green-500 mr-1" />;
      case 'cancelled':
        return <FiXCircle className="text-red-500 mr-1" />;
      case 'pending':
        return <FiLoader className="text-yellow-500 mr-1 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-x-hidden">
      <Sidebar role="doctor" />
      
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-gray-800 mb-1"
          >
            {getDisplayName()}
          </motion.h1>
          
          {user?.email && (
            <p className="text-gray-600 mb-4 flex items-center text-sm md:text-base">
              <FiMail className="mr-2" /> {user.email}
            </p>
          )}
          
          <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4 md:mb-6"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {Object.entries(stats).map(([key, value], index) => (
            <motion.div 
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-md p-3 md:p-4 border-l-4 ${
                key === 'total' ? 'border-blue-500' :
                key === 'confirmed' ? 'border-green-500' :
                key === 'pending' ? 'border-yellow-500' : 'border-red-500'
              }`}
            >
              <h3 className="text-xs md:text-sm font-medium text-gray-500 capitalize">
                {key.replace('_', ' ')}
              </h3>
              <p className="text-xl md:text-2xl font-bold text-gray-800">{value}</p>
            </motion.div>
          ))}
        </div>

        {/* Profile and Availability Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md md:shadow-lg p-4 md:p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                <FiUser className="mr-2 text-blue-500" />
                Profile Settings
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6">
              <div className="relative">
                {loading ? (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 animate-pulse"></div>
                ) : user?.doctorProfile?.profileImage ? (
                  <img
                    src={user.doctorProfile.profileImage}
                    alt="Profile"
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 md:border-4 border-white shadow-sm md:shadow-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-profile.jpg';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-3xl md:text-4xl font-bold text-blue-600 border-2 md:border-4 border-white shadow-sm md:shadow-md">
                    {user?.doctorProfile?.name?.charAt(0) || user?.name?.charAt(0) || "D"}
                  </div>
                )}
              </div>
              
              <div className="flex-1 w-full">
                <ProfileUpload onUpload={handleProfileUpdate} />
                <div className="mt-3 md:mt-4 space-y-1 md:space-y-2">
                  {user?.doctorProfile?.specialty && (
                    <div className="flex items-center">
                      <FiAward className="text-blue-500 mr-2" />
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium">
                        {user.doctorProfile.specialty}
                      </span>
                    </div>
                  )}
                  {user?.doctorProfile?.qualifications && (
                    <p className="text-gray-600 text-xs md:text-sm">
                      {user.doctorProfile.qualifications}
                    </p>
                  )}
                  {user?.doctorProfile?.phone && (
                    <div className="flex items-center text-gray-600 text-xs md:text-sm">
                      <FiPhone className="mr-2" /> {user.doctorProfile.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Availability Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md md:shadow-lg p-4 md:p-6 border border-gray-100"
          >
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center mb-3 md:mb-4">
              <FiClock className="mr-2 text-blue-500" />
              Manage Availability
            </h2>
            <AvailabilityCalendar onUpdate={fetchData} />
          </motion.div>
        </div>

        {/* Appointments Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md md:shadow-lg p-4 md:p-6 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 space-y-3 md:space-y-0">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
              <FiCalendar className="mr-2 text-blue-500" />
              Appointments Management
            </h2>
            
            <div className="flex space-x-1 md:space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-2 py-1 text-xs md:text-sm rounded-md transition-colors ${
                  activeTab === "upcoming" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`px-2 py-1 text-xs md:text-sm rounded-md transition-colors ${
                  activeTab === "past" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-2 py-1 text-xs md:text-sm rounded-md transition-colors ${
                  activeTab === "all" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <FiLoader className="animate-spin text-blue-500 text-2xl" />
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Details
                      </th>
                      <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appointment
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
                    {filteredAppointments.map((appointment) => (
                      <motion.tr 
                        key={appointment._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 md:px-6 md:py-4">
                          <div className="flex flex-col min-w-[150px]">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {!appointment.patientId?._id && (
                                <FiAlertTriangle className="text-yellow-500 mr-1" />
                              )}
                              {appointment.patientId?.name || "Deleted Patient"}
                            </div>
                            {appointment.patientId?.email ? (
                              <div className="text-xs md:text-sm text-gray-500 flex items-center mt-1">
                                <FiMail className="mr-1.5" /> {appointment.patientId.email}
                              </div>
                            ) : (
                              <div className="text-xs md:text-sm text-gray-400 italic">Account deleted</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4">
                          <div className="text-xs md:text-sm text-gray-900 font-medium">
                            {new Date(appointment.date).toLocaleDateString([], {
                              weekday: 'short',
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
                        <td className="px-4 py-3 md:px-6 md:py-4">
                          <div className="flex items-center">
                            {getStatusIcon(appointment.status)}
                            <span className={`text-xs md:text-sm font-medium ${
                              appointment.status === 'confirmed' ? 'text-green-600' :
                              appointment.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4">
                          <select
                            value={appointment.status}
                            onChange={(e) => updateStatus(appointment._id, e.target.value)}
                            className="block w-full pl-2 pr-8 py-1 md:py-2 text-xs md:text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm"
                            disabled={!appointment.patientId?._id}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg">
              <FiCalendar className="mx-auto text-3xl md:text-4xl text-gray-400 mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900">
                No {activeTab} appointments
              </h3>
              <p className="mt-1 text-xs md:text-sm text-gray-500 max-w-md mx-auto">
                {activeTab === 'upcoming' ? 
                  "You currently don't have any upcoming appointments. New appointments will appear here when patients book with you." : 
                  "Your past appointment history will appear here."}
              </p>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
};

export default DoctorDashboard;