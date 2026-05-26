import { useEffect, useState } from "react";
import { Button, Result, Spin, Typography, notification } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../services/apiClient";

const { Paragraph } = Typography;

const PayPalReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const paypalOrderId = searchParams.get("paypalOrderId");

    const capturePayment = async () => {
      if (!orderId || !paypalOrderId) {
        setError("Thiếu orderId hoặc paypalOrderId trong callback của PayPal.");
        setLoading(false);
        return;
      }

      try {
        await apiClient.post(
          `/api/payments/paypal/orders/${orderId}/capture?paypalOrderId=${encodeURIComponent(paypalOrderId)}`,
        );

        notification.success({
          message: "Thanh toán PayPal thành công",
          description: "Đơn hàng đã được capture và ghi nhận hoàn tất.",
        });

        navigate(`/orders/${orderId}`, { replace: true });
      } catch (captureError) {
        console.error("Failed to capture PayPal payment:", captureError);
        setError(
          captureError.response?.data?.message ||
            "Không thể capture thanh toán PayPal. Vui lòng thử lại.",
        );
        setLoading(false);
      }
    };

    capturePayment();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <Spin size="large" />
          <Paragraph className="mt-4 text-gray-600">
            Đang xác nhận thanh toán PayPal...
          </Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Result
        status="error"
        title="Thanh toán chưa hoàn tất"
        subTitle={error}
        extra={[
          <Button key="orders" type="primary" onClick={() => navigate("/orders")}>
            Xem đơn hàng
          </Button>,
          <Button key="checkout" onClick={() => navigate("/checkout")}>
            Quay lại checkout
          </Button>,
        ]}
      />
    </div>
  );
};

export default PayPalReturn;