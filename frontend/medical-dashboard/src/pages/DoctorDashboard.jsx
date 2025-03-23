import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import ProfileUpload from '../components/ProfileUpload';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await api.get('/doctors/appointments');
        setAppointments(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAppointments();
  }, []);

  const updateStatus = async (appointmentId, status) => {
    try {
      const { data } = await api.put(`/doctors/appointments/${appointmentId}`, { status });
      setAppointments(appointments.map(a => 
        a._id === appointmentId ? data : a
      ));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="doctor" />
      <main className="flex-1 p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-8">Dr. {user?.name}</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <ProfileUpload />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Set Availability</h2>
            <AvailabilityCalendar />
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appointment => (
                  <tr key={appointment._id}>
                    <td>{appointment.patientId?.name}</td>
                    <td>{new Date(appointment.date).toLocaleString()}</td>
                    <td>{appointment.status}</td>
                    <td>
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
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DoctorDashboard;