import { Alert, Button, Form, Input, Typography, notification } from "antd";
import React, { useState, useEffect } from "react";
import {
  MailOutlined,
  SendOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Add framer-motion for animations
import apiClient from "../../services/apiClient.js";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    document.title = "Forgot Password - Movie Reservation System";
  }, []);

  const openNotificationWithIcon = (type, title, description, duration) => {
    api[type]({
      message: title,
      description: description,
      duration: duration,
    });
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError("");

    try {
      await apiClient.get(
        `/api/auth/forgot-password?email=${values.email}&host=${window.location.origin}`
      );
      setLoading(false);
      setSuccess(true);
      openNotificationWithIcon(
        "success",
        "Email đã được gửi!",
        "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến.",
        0
      );
    } catch (error) {
      setLoading(false);
      console.error(error);
      if (error.response) {
        setError(
          error.response.data?.message || "Có lỗi xảy ra. Vui lòng thử lại sau."
        );
      } else {
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')",
        }}
      ></div>

      {contextHolder}
      <div className="grid md:grid-cols-2 w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden z-10 mb-40">
        {/* Left side - Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 md:p-12"
        >
          <div className="mb-8 text-center">
            <Title level={2} className="text-gray-800 mb-2">
              Quên mật khẩu?
            </Title>
            <Text className="text-gray-500">
              Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
            </Text>
          </div>

          {error && (
            <Alert message={error} type="error" showIcon className="mb-6" />
          )}

          {success ? (
            <div className="text-center">
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <div className="flex justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <Text className="text-gray-700 mb-4 block">
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
                  Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn.
                </Text>
                <Text className="text-gray-500 text-sm block">
                  Nếu bạn không nhận được email trong vài phút, vui lòng kiểm
                  tra thư mục spam.
                </Text>
              </div>

              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/login")}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Quay lại đăng nhập
              </Button>
            </div>
          ) : (
            <Form
              name="forgot-password-form"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email của bạn!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
                hasFeedback
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400 mr-2" />}
                  placeholder="Email"
                  className="rounded-lg"
                  autoFocus
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SendOutlined />}
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
                  Gửi liên kết đặt lại
                </Button>
              </Form.Item>

              <div className="text-center mt-6">
                <Button
                  type="link"
                  onClick={() => navigate("/login")}
                  className="text-indigo-600 hover:text-indigo-800"
                  icon={<ArrowLeftOutlined />}
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            </Form>
          )}
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
                "url('https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/70 to-purple-900/90"></div>
            <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
              <div className="text-center max-w-md">
                <h2 className="text-3xl font-bold mb-6">
                  Forgot Your Password?
                </h2>
                <p className="text-white/80 mb-8">
                  Don't worry, it happens to the best of us. Enter your email
                  address and we'll help you reset your password.
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

export default ForgotPassword;
