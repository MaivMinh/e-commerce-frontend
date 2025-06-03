import { jwtDecode } from "jwt-decode";
import React, { createContext, useState, useEffect, useContext } from "react";
import apiClient from "../services/apiClient.js";

export const AuthContext = createContext({
  auth: {
    isAuthenticated: false,
    accountId: null,
  },
  loading: null,
  login: () => {},
  logout: () => {},
  profile: {
    id: null,
    username: null,
    email: null,
    name: null,
    role: null,
    avatar: null,
    addressDTOs: [],
  },
});

export const AuthContextProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: null,
    accountId: null,
  });
  const [profile, setProfile] = useState({
    id: null,
    username: null,
    email: null,
    name: null,
    role: null,
    avatar: null,
    addressDTOs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access-token");
    if (token) {
      handleLogin(token);
    } else {
      setAuth((prev) => {
        return {
          ...prev,
          isAuthenticated: false,
          accountId: null,
        };
      });
      setProfile((prev) => {
        return {
          ...prev,
          id: null,
          username: null,
          email: null,
          name: null,
          role: null,
          avatar: null,
          addressDTOs: [],
        };
      });
      localStorage.removeItem("access-token");
      localStorage.removeItem("refresh-token");
      localStorage.removeItem("profile");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated) {
      const fetchProfileData = async () => {
        if (localStorage.getItem("profile")) {
          setProfile(JSON.parse(localStorage.getItem("profile")));
          return;
        }
        const response = await apiClient.get(`/api/user/profile`);
        setProfile(response.data.data);
        localStorage.setItem("profile", JSON.stringify(response.data.data));
      };
      fetchProfileData();
    }
  }, [auth]);

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
        profile: profile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the context
export const useAuthContext = () => useContext(AuthContext);
