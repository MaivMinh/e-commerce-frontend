import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const PublicPage = ({ children }) => {
  const { auth, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return;

  return !auth.isAuthenticated ? (
    children
  ) : (
    <Navigate to="/" state={{ from: location.pathname }} replace />
  );
};

export default PublicPage;