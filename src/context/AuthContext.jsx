import { jwtDecode } from "jwt-decode";
import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext({
  auth: {
    isAuthenticated: false,
    accountId: null,
  },
  loading: null,
  login: () => {},
  logout: () => {},
});
export const AuthContextProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: null,
    accountId: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access-token");
    if (token) {
      handleLogin(token);
    } else  {
      setAuth((prev) => {
        return {
          ...prev,
          isAuthenticated: false,
          accountId: null,
        };
      });
      localStorage.removeItem("access-token");
      localStorage.removeItem("refresh-token");
      localStorage.removeItem("profile");
    }
    setLoading(false);
  }, []);

  function handleLogin(token) {
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 > Date.now()) {
        localStorage.setItem("access-token", token);
        setAuth((prev) => {
          return {
            ...prev,
            isAuthenticated: true,
            accountId: decodedToken.account_id,
          };
        });
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
      setAuth((prev) => {
        return {
          ...prev,
          isAuthenticated: false,
          accountId: null,
        };
      });
      localStorage.removeItem("access-token");
      localStorage.removeItem("refresh-token");
      localStorage.removeItem("profile");
    }
  }

  function handleLogout() {
    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("profile");
    setAuth((prev) => {
      return {
        ...prev,
        isAuthenticated: false,
        accountId: null,
      };
    });
  }

  return (
    <AuthContext.Provider
      value={{
        auth: auth,
        loading: loading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the context
export const useAuthContext = () => useContext(AuthContext);