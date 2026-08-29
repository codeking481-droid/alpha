import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, requirePayment = true }) => {
  const { user, loading, hasAccess } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-[#FFFCF8]">Loading Alpha OS...</div>;
  }

  // Demo mode allows localStorage user
  const demoUser = localStorage.getItem('demo_user');
  const effectiveUser = user || (demoUser ? JSON.parse(demoUser) : null);

  if (!effectiveUser) {
    return <Navigate to="/" replace />;
  }

  if (requirePayment && !hasAccess) {
    // In demo, if API missing, still redirect to /access to complete paywall flow
    return <Navigate to="/access" replace />;
  }

  return children;
};