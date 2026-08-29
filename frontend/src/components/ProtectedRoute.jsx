import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, requirePayment = true }) => {
  const { user, loading, hasAccess } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-[#FFFCF8]">Loading Alpha OS...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requirePayment && !hasAccess) {
    return <Navigate to="/access" replace />;
  }

  return children;
};
