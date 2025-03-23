import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, appointmentsRes] = await Promise.all([
          api.get('/doctors/all-doctors'),
          api.get('/appointments/my-appointments')
        ]);
        setDoctors(doctorsRes.data);
        setAppointments(appointmentsRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const bookAppointment = async (doctorId, date) => {
    try {
      const { data } = await api.post('/appointments/book', { doctorId, date });
      setAppointments([...appointments, data]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="patient" />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8">Welcome, {user?.name}</h1>
        
        {/* Doctors List */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Available Doctors</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doctor => (
              <div key={doctor._id} className="bg-white p-6 rounded-lg shadow">
                <img 
                  src={doctor.profileImage} 
                  alt={doctor.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h3 className="text-lg font-bold">{doctor.name}</h3>
                <p className="text-gray-600">{doctor.specialty}</p>
                {/* Add booking form here */}
              </div>
            ))}
          </div>
        </section>

        {/* Appointments */}
        <section>
          <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appointment => (
                  <tr key={appointment._id}>
                    <td>{appointment.doctorId.name}</td>
                    <td>{new Date(appointment.date).toLocaleString()}</td>
                    <td>{appointment.status}</td>
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

export default PatientDashboard;