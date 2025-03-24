import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext'; // ✅ Correct usage

import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { user, loading } = useAuth(); // Destructure the loading state and user from context

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while the user is being fetched
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/admin" 
          element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route 
          path="/doctor" 
          element={user?.role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/login" />}
        />
        <Route 
          path="/patient" 
          element={user?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
