import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/" state={{ from: location }} replace />;
  if (!allowedRoles.includes(user.role)) 
    return <Navigate to={`/${user.role}`} replace />;
  
  return children;
};

export default ProtectedRoute;