import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const PatientDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [doctorsRes, appointmentsRes] = await Promise.all([
          api.get("/doctors/all-doctors"),
          api.get("/appointments/my-appointments"),
        ]);

        const doctorsWithImages = doctorsRes.data.map((doctor) => ({
          ...doctor,
          profileImage: doctor.profileImage || "/default-profile.jpg",
        }));

        setDoctors(doctorsWithImages);
        setAppointments(appointmentsRes.data || []);
      } catch (err) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, refreshTrigger]);

  const bookAppointment = async (doctorId, date) => {
    try {
      const { data } = await api.post("/appointments/book", { doctorId, date });
      setAppointments((prevAppointments) => [...prevAppointments, data]);
      setRefreshTrigger((prev) => !prev); // Trigger refresh of doctor availability
    } catch (err) {
      console.error("Error booking appointment:", err);
    }
  };

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in.</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="patient" />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {user?.name || "Guest"}
        </h1>
        <hr className="border-t-2 border-gray-300 mb-8 w-full" />

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Available Doctors</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white p-6 rounded-lg shadow"
                >
                  <img
                    src={doctor.profileImage}
                    alt={doctor.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                    onError={(e) => {
                      e.target.src = "/default-profile.jpg";
                    }}
                  />
                  <h3 className="text-lg font-bold">{doctor.name}</h3>
                  <p className="text-gray-600">{doctor.specialty}</p>
                  <p className="text-gray-600 text-sm mt-2">
                    {doctor.qualifications}
                  </p>
                  <h4 className="text-md font-semibold mt-4">
                    Available Slots
                  </h4>
                  <ul>
                    {doctor.availableSlots?.length > 0 ? (
                      doctor.availableSlots.map((slot, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {new Date(slot).toLocaleString()}
                          <button
                            className="ml-4 text-white py-2 px-4 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300"
                            onClick={() => bookAppointment(doctor._id, slot)}
                          >
                            Book
                          </button>
                        </li>
                      ))
                    ) : (
                      <li>No available slots</li>
                    )}
                  </ul>
                </div>
              ))
            ) : (
              <p>No doctors available.</p>
            )}
          </div>
        </section>

        {/* Appointments Section */}
        <section id="appointments-section">
          <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{appointment.patientId?.name || "N/A"}</td>
                      <td>
                        {appointment.doctorId?.userId?.name ||
                          "Doctor not found"}
                      </td>
                      <td>{new Date(appointment.date).toLocaleString()}</td>
                      <td>{appointment.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No appointments found.</td>
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

export default PatientDashboard;
