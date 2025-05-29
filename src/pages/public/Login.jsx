import {
  Alert,
  Button,
  Form,
  Input,
  Divider,
  Typography,
  notification,
} from "antd";
import React, { useContext, useState, useEffect } from "react";
import {
  LockOutlined,
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient.js";
import { motion } from "framer-motion"; // Add framer-motion for animations
import { AuthContext } from "../../context/AuthContext.jsx";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, auth } = useContext(AuthContext);
  const params = new URLSearchParams(window.location.search);
  const registered = params.get("registered");
  const expired = params.get("expired");
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, title, description, duration) => {
    api[type]({
      message: title,
      description: description,
      duration: duration,
    });
  };

  const from = location.state?.from?.pathname || "/"; /// Redirect after login.

  useEffect(() => {
    // Optional: Add a simple animation when the component mounts
    document.title = "Login - E-commerce Shop";
    if (expired && expired === "true") {
      openNotificationWithIcon(
        "error",
        "Phiên đăng nhập đã hết hạn!",
        "Vui lòng đăng nhập lại để tiếp tục.",
        5
      );
    }
    if (registered && registered === "true") {
      openNotificationWithIcon(
        "success",
        "Đăng kí tài khoản thành công!",
        "",
        4
      );
      setTimeout(() => {
        openNotificationWithIcon(
          "success",
          "Kích hoạt tài khoản",
          "Email đã được gửi đến địa chỉ của bạn. Vui lòng kiểm tra email để kích hoạt tài khoản.",
          0
        );
      }, 3500);
    }
  }, [registered]);

  const onFinish = async (values) => {
    setLoading(true);
    apiClient
      .post("/api/auth/login", values)
      .then((response) => {
        console.log(response);
        const payload = response.data;
        const data = payload.data;
        const accessToken = data.accessToken;
        const refreshToken = data.refreshToken;
        localStorage.setItem("refresh-token", refreshToken);
        login(accessToken);
        navigate(from, { replace: true });
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        if (error.response) {
          setError(error.response.data?.message);
        } else {
          setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
        }
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 to-purple-900/40"></div>
      </div>
      {contextHolder}
      <div className="grid md:grid-cols-2 w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden z-10">
        {/* Left side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 md:p-12"
        >
          <div className="mb-8 text-center">
            <Title level={2} className="text-gray-800 mb-2">
              Welcome Back
            </Title>
          </div>

          {error && (
            <Alert message={error} type="error" showIcon className="mb-6" />
          )}

          <Form
            name="login-form"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please enter your username!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Username"
                className="rounded-lg"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Password"
                className="rounded-lg"
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                className="p-0 font-semibold text-purple-600 hover:text-purple-800 cursor-pointer"
                onClick={() => navigate("/account/forgot-password")}
              >
                Forgot password?
              </button>
            </div>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<LoginOutlined />}
                className="w-full h-12"
                style={{
                  backgroundColor: "#4F46E5",
                  borderColor: "#4F46E5",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "16px",
                  height: "48px",
                  lineHeight: "48px",
                  borderRadius: "8px",
                  transition:
                    "background-color 0.3s ease, border-color 0.3s ease",
                }}
              >
                Log In
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>
            <span className="text-gray-400 font-semibold">or login with</span>
          </Divider>
          <div className="w-full flex flex-row justify-center items-center -mt-3">
            <a className="cursor-pointer" href="https://google.com">
              <GoogleOutlined
                style={{
                  fontSize: "32px",
                  color: "#000",
                }}
              />
            </a>
          </div>

          <Divider plain>
            <span className="text-gray-400">New to our platform?</span>
          </Divider>

          <Button
            type="default"
            icon={<UserAddOutlined />}
            onClick={() => navigate("/register")}
            className="w-full h-12 border-indigo-600 text-indigo-600 hover:text-indigo-700 hover:border-indigo-700 rounded-lg"
          >
            Create an Account
          </Button>
        </motion.div>

        {/* Right side - Image/Graphics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="hidden md:block relative"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://plus.unsplash.com/premium_photo-1700056214664-4bd97cec12b4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/40 to-purple-900/40"></div>
            <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
              <div className="text-center max-w-md">
                <h2 className="text-3xl font-bold mb-6">
                  Shopping Experience Awaits
                </h2>
                <p className="text-white/80 mb-8">
                  Discover amazing products, enjoy exclusive deals, and
                  experience convenient shopping with fast delivery right to
                  your doorstep.
                </p>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full bg-white/60"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
