import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url: "http://localhost:9090",
  realm: "ecommerce-realm",
  clientId: 'e-commerce',
});

// Utility functions
export const login = (redirectUri) => {
  return keycloak.login({
    redirectUri: redirectUri || window.location.origin + '/'
  });
};

export const logout = () => {
  // Xóa tokens trước khi logout
  localStorage.removeItem("kc_token");
  localStorage.removeItem("kc_refreshToken");
  localStorage.removeItem("kc_idToken");
  
  return keycloak.logout({
    redirectUri: window.location.origin + "/login"
  });
};

export const getToken = () => {
  return keycloak.token;
};

export const isAuthenticated = () => {
  return keycloak.authenticated && keycloak.token;
};

export const getUser = () => {
  if (!keycloak.tokenParsed) return null;
  
  return {
    username: keycloak.tokenParsed.preferred_username,
    email: keycloak.tokenParsed.email,
    name: keycloak.tokenParsed.name,
    firstName: keycloak.tokenParsed.given_name,
    lastName: keycloak.tokenParsed.family_name,
    roles: keycloak.tokenParsed.realm_access?.roles || []
  };
};

export const getUserId = () => {
  if (!keycloak.tokenParsed) return null;
  return keycloak.tokenParsed.sub;
}

// Force refresh token
export const refreshToken = () => {
  return keycloak.updateToken(5);
};