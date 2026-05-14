import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { KeycloakContext } from "./KeycloakProvider";

const PublicPage = ({ children }) => {
  const { authenticated, loading } = useContext(KeycloakContext);
  const location = useLocation();

  if (loading) return;

  return authenticated ? (
    children
  ) : (
    <Navigate to="/" state={{ from: location.pathname }} replace />
  );
};

export default PublicPage;