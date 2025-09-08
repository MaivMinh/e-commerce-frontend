import { useContext } from 'react';
import { KeycloakContext } from './KeycloakProvider';
import { login } from '../services/keycloak';

const PrivateRoute = ({ children }) => {
  const { authenticated, loading } = useContext(KeycloakContext);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <button 
          onClick={() => login()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login to Continue
        </button>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;