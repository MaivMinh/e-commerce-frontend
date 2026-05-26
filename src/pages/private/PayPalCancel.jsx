import { useEffect, useState } from "react";
import { Button, Result, Spin, Typography, notification } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../services/apiClient";

const { Paragraph } = Typography;

const PayPalCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const paypalOrderId = searchParams.get("paypalOrderId");

    const cancelPayment = async () => {
      if (!orderId || !paypalOrderId) {
        setError("Thiếu orderId hoặc paypalOrderId trong callback của PayPal.");
        setLoading(false);
        return;
      }

      try {
        await apiClient.post(
          `/api/payments/paypal/orders/${orderId}/cancel?paypalOrderId=${encodeURIComponent(paypalOrderId)}`,
        );

        notification.info({
          message: "Đã hủy thanh toán PayPal",
          description: "Hệ thống đã nhận trạng thái hủy để xử lý rollback.",
        });

        navigate(`/orders/${orderId}`, { replace: true });
      } catch (cancelError) {
        console.error("Failed to cancel PayPal payment:", cancelError);
        setError(
          cancelError.response?.data?.message ||
            "Không thể hủy thanh toán PayPal. Vui lòng thử lại.",
        );
        setLoading(false);
      }
    };

    cancelPayment();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <Spin size="large" />
          <Paragraph className="mt-4 text-gray-600">
            Đang xử lý hủy thanh toán PayPal...
          </Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Result
        status="warning"
        title="Thanh toán đã bị hủy"
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

export default PayPalCancel;