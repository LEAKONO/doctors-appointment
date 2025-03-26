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
  const [imagesLoaded, setImagesLoaded] = useState({});

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]); // Removed refreshTrigger from dependencies

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [doctorsRes, appointmentsRes] = await Promise.all([
        api.get("/doctors/all-doctors"),
        api.get("/appointments/my-appointments"),
      ]);

      const doctorsWithImages = doctorsRes.data.map((doctor) => ({
        ...doctor,
        profileImage: doctor.profileImage 
          ? doctor.profileImage.startsWith('http') 
            ? doctor.profileImage 
            : `http://localhost:5000${doctor.profileImage}`
          : '/default-profile.jpg'
      }));

      setDoctors(doctorsWithImages);
      setAppointments(appointmentsRes.data || []);
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async (doctorId, date) => {
    try {
      const { data } = await api.post("/appointments/book", { doctorId, date });
      // Update local state immediately
      setAppointments(prev => [...prev, data]);
      // Optionally: Re-fetch to ensure consistency
      await fetchData();
    } catch (err) {
      console.error("Error booking appointment:", err);
    }
  };

  const handleImageLoad = (doctorId) => {
    setImagesLoaded(prev => ({...prev, [doctorId]: true}));
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role="patient" />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-px bg-gray-200"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role="patient" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Please log in</h2>
            <p className="text-gray-600">You need to be logged in to view this page</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="patient" />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {user.name}
        </h1>
        <hr className="border-t-2 border-gray-300 mb-8 w-full" />

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Available Doctors</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <div key={doctor._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  {/* Image with loading state - no alt text to prevent blinking */}
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {!imagesLoaded[doctor._id] && (
                      <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse"></div>
                    )}
                    <img
                      src={doctor.profileImage}
                      alt=""
                      className={`w-full h-full rounded-full object-cover border-2 border-gray-200 ${
                        !imagesLoaded[doctor._id] ? 'opacity-0' : 'opacity-100'
                      }`}
                      onLoad={() => handleImageLoad(doctor._id)}
                      onError={(e) => {
                        e.target.src = "/default-profile.jpg";
                        handleImageLoad(doctor._id);
                      }}
                    />
                  </div>
                  
                  {/* Doctor details - always visible */}
                  <div className="text-center">
                    <h3 className="text-lg font-bold">{doctor.name}</h3>
                    <p className="text-gray-600">{doctor.specialty}</p>
                    <p className="text-gray-600 text-sm mt-2">
                      {doctor.qualifications}
                    </p>
                  </div>

                  {/* Available slots - always visible */}
                  <div className="mt-4">
                    <h4 className="text-md font-semibold mb-2">Available Slots</h4>
                    <ul className="space-y-2">
                      {doctor.availableSlots?.length > 0 ? (
                        doctor.availableSlots.map((slot, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {new Date(slot).toLocaleString()}
                            </span>
                            <button
                              className="text-white py-1 px-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 text-sm"
                              onClick={() => bookAppointment(doctor._id, slot)}
                            >
                              Book
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500">No available slots</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No doctors available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Appointments section */}
        <section id="appointments-section">
          <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left border">Owner</th>
                  <th className="p-3 text-left border">Doctor</th>
                  <th className="p-3 text-left border">Date</th>
                  <th className="p-3 text-left border">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="p-3 border">{appointment.patientId?.name || "N/A"}</td>
                      <td className="p-3 border">
                        {appointment.doctorId?.userId?.name || "Doctor not found"}
                      </td>
                      <td className="p-3 border">{new Date(appointment.date).toLocaleString()}</td>
                      <td className="p-3 border">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : appointment.status === 'cancelled' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      No appointments found.
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

export default PatientDashboard;