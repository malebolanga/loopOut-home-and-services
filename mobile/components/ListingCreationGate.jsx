import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ListingCreationGate({ children }) {
  const { currentUser } = useSelector((state) => state.user);
  if (currentUser?.offeringType === 'viewer') return <Navigate to="/become" replace />;
  if (currentUser?.offeringType === 'food') return <Navigate to="/food/register" replace />;
  return children;
}
