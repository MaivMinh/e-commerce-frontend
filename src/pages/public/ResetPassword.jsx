import { Alert, Button, Form, Input, Typography, notification } from "antd";
import React, { useState, useEffect } from "react";
import {
  LockOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion"; // Add framer-motion for animations
import apiClient from "../../services/apiClient";

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    document.title = "Reset Password - E-commerce platform";

    // Validate token exists
    if (!token) {
      setError(
        "Missing reset token. Please request a new password reset link."
      );
    }
  }, [token]);

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
      ///This would be your actual API endpoint with token and new password
      await apiClient.post(`/api/auth/reset-password?token=${token}`, {
        newPassword: values.password,
      });

      setLoading(false);
      setSuccess(true);
      openNotificationWithIcon(
        "success",
        "Mật khẩu đã được đặt lại!",
        "Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể đăng nhập bằng mật khẩu mới.",
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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 to-indigo-900/60"></div>
      </div>

      {contextHolder}
      <div className="grid md:grid-cols-2 w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden z-10">
        {/* Left side - Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 md:p-12"
        >
          <div className="mb-8 text-center">
            <Title level={2} className="text-gray-800 mb-2">
              Đặt lại mật khẩu
            </Title>
            <Text className="text-gray-500">
              Tạo mật khẩu mới cho tài khoản của bạn
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
                  Mật khẩu của bạn đã được đặt lại thành công! Bạn có thể đăng
                  nhập bằng mật khẩu mới.
                </Text>
              </div>

              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/login")}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Đăng nhập ngay
              </Button>
            </div>
          ) : (
            <Form
              name="reset-password-form"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                    message:
                      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.",
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400 mr-2" />}
                  placeholder="Mật khẩu mới"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Hai mật khẩu không khớp!")
                      );
                    },
                  }),
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={
                    <CheckCircleOutlined className="text-gray-400 mr-2" />
                  }
                  placeholder="Xác nhận mật khẩu"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
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
                  disabled={!token}
                >
                  Đặt lại mật khẩu
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
                "url('https://images.unsplash.com/photo-1614849427248-61c7b366d120?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/70 to-purple-900/90"></div>
            <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
              <div className="text-center max-w-md">
                <h2 className="text-3xl font-bold mb-6">Secure Your Account</h2>
                <p className="text-white/80 mb-8">
                  Create a strong password to protect your account and continue
                  enjoying our movie reservation services.
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

export default ResetPassword;
