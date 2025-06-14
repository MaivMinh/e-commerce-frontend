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
  refreshProfile: () => {},
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

  const refreshProfile = async () => {
    if (auth.isAuthenticated) {
      await fetchProfileData();
    }
  };

  const fetchProfileData = async () => {
    try {
      const response = await apiClient.get(`/api/users/profile`);
      setProfile(response.data.data);
      localStorage.setItem("profile", JSON.stringify(response.data.data));
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
      // Sử dụng dữ liệu từ localStorage nếu call API thất bại
      if (localStorage.getItem("profile")) {
        setProfile(JSON.parse(localStorage.getItem("profile")));
      }
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
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

  const handleLogout = async () => {
    try {
      /// Gọi tới API để logout nếu cần
      const token = localStorage.getItem("access-token");
      if (!token) {
        console.warn("No access token found for logout.");
        return;
      }
      await apiClient.post(`/api/auth/logout?token=${token}`);

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
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth: auth,
        loading: loading,
        login: handleLogin,
        logout: handleLogout,
        refreshProfile, 
        profile: profile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the context
export const useAuthContext = () => useContext(AuthContext);
