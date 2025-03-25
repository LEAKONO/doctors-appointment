import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import ProfileUpload from '../components/ProfileUpload';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const { user, updateUserProfile } = useAuth(); // Changed from setUser to updateUserProfile
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/doctors/appointments');
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/doctors/profile');
      if (data) {
        updateUserProfile(data); // Use the context's update function
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
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
  }, []);

  const updateStatus = async (appointmentId, status) => {
    try {
      const { data } = await api.put(`/doctors/appointments/${appointmentId}`, { status });
      setAppointments(prev =>
        prev.map(appointment => 
          appointment._id === appointmentId ? data : appointment
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleProfileUpdate = async (newData) => {
    try {
      await api.post('/doctors/profile', newData);
      await fetchProfile(); // Refetch the latest profile data
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  const getDisplayName = () => {
    if (loading) return "Loading...";
    return `Dr. ${user?.doctorProfile?.name || user?.name || "Unknown"}`;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="doctor" />
      <main className="flex-1 p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-2">
          {getDisplayName()}
        </h1>

        {user?.email && (
          <p className="text-gray-600 mb-4">{user.email}</p>
        )}

        <div className="w-full border-b-4 border-green-500 mb-8"></div>

        <div className="grid md:grid-cols-2 gap-8">
          <div id="profile-section">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <div className="flex items-center space-x-4">
              {loading ? (
                <p>Loading profile...</p>
              ) : (
                <img
                  src={user?.doctorProfile?.profileImage || "/default-avatar.png"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border"
                />
              )}
              <ProfileUpload onSuccess={handleProfileUpdate} />
            </div>
          </div>

          <div id="availability-section">
            <h2 className="text-xl font-semibold mb-4">Set Availability</h2>
            <AvailabilityCalendar onUpdate={fetchData} />
          </div>
        </div>

        <section id="appointments-section" className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Patient</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map(appointment => (
                    <tr key={appointment._id} className="border">
                      <td className="p-2 border">{appointment.patientId?.name || "Unknown"}</td>
                      <td className="p-2 border">
                        {new Date(appointment.date).toLocaleString()}
                      </td>
                      <td className="p-2 border">{appointment.status}</td>
                      <td className="p-2 border">
                        <select
                          value={appointment.status}
                          onChange={(e) => updateStatus(appointment._id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center">
                      {loading ? "Loading appointments..." : "No appointments available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DoctorDashboard;