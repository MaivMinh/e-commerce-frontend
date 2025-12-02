import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { KeycloakContext } from './KeycloakProvider';
import { login } from '../services/keycloak';

const PrivateRoute = ({ children }) => {
  const { authenticated, loading } = useContext(KeycloakContext);
  const location = useLocation();

  useEffect(() => {
    if (!loading && !authenticated) {
      // Lưu current URL để redirect về sau khi login
      const currentUrl = window.location.href;
      login(currentUrl); // Pass current URL as redirect URI
    }
  }, [authenticated, loading, location]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status"></div>
          <p className="mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status"></div>
          <p className="mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;