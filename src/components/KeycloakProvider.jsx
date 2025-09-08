import React, { useState, useEffect } from "react";
import { keycloak } from "../services/keycloak";

export const KeycloakContext = React.createContext({
  authenticated: null,
  loading: null,
});

export const KeycloakProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Đổi từ sessionStorage sang localStorage
    const storedToken = localStorage.getItem("kc_token");
    const storedRefreshToken = localStorage.getItem("kc_refreshToken");
    const storedIdToken = localStorage.getItem("kc_idToken");

    keycloak
      .init({
        onLoad: "check-sso", // ✅ Đổi từ "login-required" sang "check-sso"
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
        pkceMethod: "S256",
        // Khôi phục tất cả tokens
        token: storedToken || undefined,
        refreshToken: storedRefreshToken || undefined,
        idToken: storedIdToken || undefined,
      })
      .then((auth) => {
        setAuthenticated(auth);

        if (auth && keycloak.token) {
          // Lưu tất cả tokens vào localStorage
          localStorage.setItem("kc_token", keycloak.token);
          localStorage.setItem("kc_refreshToken", keycloak.refreshToken);
          localStorage.setItem("kc_idToken", keycloak.idToken);

          // 🕑 Setup auto-refresh với cleanup
          const refreshInterval = setInterval(() => {
            keycloak
              .updateToken(60) // Refresh nếu token sẽ hết hạn trong 60s
              .then((refreshed) => {
                if (refreshed) {
                  console.log("🔄 Token refreshed");
                  // Cập nhật localStorage với tokens mới
                  localStorage.setItem("kc_token", keycloak.token);
                  localStorage.setItem("kc_refreshToken", keycloak.refreshToken);
                  localStorage.setItem("kc_idToken", keycloak.idToken);
                }
              })
              .catch(() => {
                console.warn("⚠️ Token refresh failed, logging out");
                // Xóa tokens khi logout
                localStorage.removeItem("kc_token");
                localStorage.removeItem("kc_refreshToken");
                localStorage.removeItem("kc_idToken");
                keycloak.logout();
              });
          }, 30000); // Check mỗi 30s

          // Cleanup interval khi component unmount
          return () => clearInterval(refreshInterval);
        }
      })
      .catch((err) => {
        console.error("Keycloak init failed", err);
        // Xóa tokens lỗi
        localStorage.removeItem("kc_token");
        localStorage.removeItem("kc_refreshToken");
        localStorage.removeItem("kc_idToken");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Event listeners cho Keycloak events
  useEffect(() => {
    const onTokenExpired = () => {
      console.log("🔄 Token expired, attempting refresh...");
      keycloak.updateToken(30).catch(() => {
        console.warn("⚠️ Token refresh failed, logging out");
        localStorage.removeItem("kc_token");
        localStorage.removeItem("kc_refreshToken");
        localStorage.removeItem("kc_idToken");
        keycloak.logout();
      });
    };

    const onAuthLogout = () => {
      console.log("👋 User logged out");
      localStorage.removeItem("kc_token");
      localStorage.removeItem("kc_refreshToken");
      localStorage.removeItem("kc_idToken");
      setAuthenticated(false);
    };

    keycloak.onTokenExpired = onTokenExpired;
    keycloak.onAuthLogout = onAuthLogout;

    return () => {
      keycloak.onTokenExpired = null;
      keycloak.onAuthLogout = null;
    };
  }, []);

  return (
    <KeycloakContext.Provider value={{ keycloak, authenticated, loading }}>
      {children}
    </KeycloakContext.Provider>
  );
};