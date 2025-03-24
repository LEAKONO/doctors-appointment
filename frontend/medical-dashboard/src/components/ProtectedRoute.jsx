import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  // If no user is logged in, redirect to the home page
  if (!user) return <Navigate to="/" state={{ from: location }} replace />;

  // If the user does not have an allowed role, redirect them based on their role
  if (!allowedRoles.includes(user.role)) 
    return <Navigate to={`/${user.role}`} replace />;
  
  return children; // Allow access to the children if the user is authorized
};

export default ProtectedRoute;
