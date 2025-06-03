import axios from "axios";

/// Cấu hình chung.
const API_BASE_URL = "http://localhost:8080/";

/// Tạo instance tập trung.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
  timeout: 20000, // 20 seconds
});

/* 
- Lưu ý rằng hàm refreshToken phải được thực hiện synchronously.
- Nếu không newAccessToken sẽ là một Promise object và khi retry sẽ không hợp lệ.
- Do đó, ta cần await hàm refreshToken để lấy giá trị trả về là newAccessToken.

- Sau khi có newAccessToken, ta cần lưu nó vào localStorage.
- Tiếp đó, điều chỉnh lại Authorization header của error trước khi retry.
- Tận dụng error object này, vì error object này bản chất là một request object với mã lỗi thay vì thành công.
- Cuối cùng, ta gọi lại apiClient với config của error object.
*/

const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refresh-token");
  if (!refreshToken) {
    return Promise.reject("No refresh token found");
  }

  return apiClient
    .get(`/api/auth/refresh-token?token=${refreshToken}`)
    .then((response) => {
      const payload = response.data;
      const data = payload.data;
      const newAccessToken = data.accessToken;
      localStorage.setItem("access-token", newAccessToken);
      return newAccessToken;
    })
    .catch((error) => {
      console.error("Failed to refresh token:", error);
      return null;
    });
};

/// Interceptors cho request.
apiClient.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    const token = localStorage.getItem("access-token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Do something with response error
    if (error.response && error.response.status === 498) {
      // Handle unauthorized access
      localStorage.removeItem("access-token");
      /// Thực hiện refresh token.

      const newAccessToken = await refreshToken();
      if (newAccessToken) {
        localStorage.setItem("access-token", newAccessToken);
        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        // Retry the original request with the new access token
        return apiClient(error.config);
      }
    }
    if (error.response && error.response.status === 499) {
      /// Handle refresh token expired.
      localStorage.removeItem("access-token");
      localStorage.removeItem("refresh-token");
      localStorage.removeItem("profile");
      window.location.href = "/login?expired=true";
      /// Redirect to login page.
      return Promise.reject("Refresh token expired");
    }
    return Promise.reject(error);
  }
);

apiClient.getData = async (url, params = {}, config = {}) => {
  const response = await apiClient.get(url, {
    params,
    ...config,
  });
  return response.data;
};

export default apiClient;
