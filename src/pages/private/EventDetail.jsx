import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  GiftOutlined,
  HomeOutlined,
  TagOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Carousel,
  Col,
  Descriptions,
  Divider,
  Empty,
  Image,
  message,
  Modal,
  notification,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Timeline,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../services/apiClient";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text, Paragraph } = Typography;
const { Countdown } = Statistic;

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isVoucherModalVisible, setIsVoucherModalVisible] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch campaign detail - Sửa lại
  // Fetch campaign detail - Cập nhật để lấy isRegistered từ API
  const fetchCampaignDetail = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/campaigns/${eventId}`);
      const data = response.data.data;
      setCampaign(data);

      // Set isRegistered từ API response
      if (data.isRegistered !== undefined) {
        setIsRegistered(data.isRegistered);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      messageApi.error(
        error.response?.data?.message || "Không thể tải thông tin sự kiện này."
      );

      // Navigate back if error
      setTimeout(() => navigate("/events"), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchCampaignDetail();
    }
  }, [eventId]);

  // Copy voucher code
  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
  };

  // Show voucher detail modal
  const showVoucherDetail = (voucher) => {
    setSelectedVoucher(voucher);
    setIsVoucherModalVisible(true);
  };

  const canRegister = () => {
    if (!campaign) return false;

    const now = dayjs();
    // Chuyển đổi Unix timestamp (giây) sang milliseconds
    const start = dayjs(campaign.startTime * 1000);
    const end = dayjs(campaign.endTime * 1000);

    console.log("Debug canRegister:", {
      now: now.format("DD/MM/YYYY HH:mm:ss"),
      start: start.format("DD/MM/YYYY HH:mm:ss"),
      end: end.format("DD/MM/YYYY HH:mm:ss"),
      isAfterEnd: now.isAfter(end),
      isAfterStart: now.isAfter(start),
      minutesUntilStart: start.diff(now, "minute"),
    });

    // Nếu sự kiện đã kết thúc
    if (now.isAfter(end)) {
      return false;
    }

    // Nếu sự kiện đã bắt đầu
    if (now.isAfter(start)) {
      return false;
    }

    // Kiểm tra thời gian còn lại trước khi bắt đầu
    const minutesUntilStart = start.diff(now, "minute");
    return minutesUntilStart > 5;
  };

  // Get registration message - Cập nhật để xử lý isRegistered
  const getRegistrationMessage = () => {
    if (!campaign) return null;

    // Nếu đã đăng ký rồi
    if (isRegistered) {
      return {
        disabled: true,
        text: "Đã đăng ký",
        type: "success",
        showAlert: false,
      };
    }

    const now = dayjs();
    const start = dayjs(campaign.startTime * 1000);
    const end = dayjs(campaign.endTime * 1000);

    console.log("Debug getRegistrationMessage:", {
      now: now.format("DD/MM/YYYY HH:mm:ss"),
      start: start.format("DD/MM/YYYY HH:mm:ss"),
      end: end.format("DD/MM/YYYY HH:mm:ss"),
      isRegistered,
    });

    // Đã kết thúc
    if (now.isAfter(end)) {
      return {
        disabled: true,
        text: "Sự kiện đã kết thúc",
        type: "default",
        showAlert: false,
      };
    }

    // Đã bắt đầu
    if (now.isAfter(start)) {
      return {
        disabled: true,
        text: "Sự kiện đã bắt đầu",
        type: "warning",
        showAlert: false,
      };
    }

    // Kiểm tra thời gian còn lại
    const minutesUntilStart = start.diff(now, "minute");

    if (minutesUntilStart <= 5) {
      return {
        disabled: true,
        text: `Không thể đăng ký (còn ${minutesUntilStart} phút)`,
        type: "warning",
        showAlert: true,
        alert: {
          message: "Không thể đăng ký",
          description: `Thời gian đăng ký đã hết. Sự kiện sẽ bắt đầu sau ${minutesUntilStart} phút. Vui lòng đăng ký trước 5 phút trước khi sự kiện diễn ra.`,
          type: "warning",
        },
      };
    }

    return {
      disabled: false,
      text: "ĐĂNG KÝ THAM GIA NGAY",
      type: "primary",
      showAlert: false,
    };
  };

  // Handle event registration - Cập nhật
  const handleRegisterEvent = async () => {
    // Không cho phép đăng ký nếu đã đăng ký rồi
    if (isRegistered) {
      messageApi.warning("Bạn đã đăng ký sự kiện này rồi!");
      return;
    }

    // Kiểm tra điều kiện đăng ký
    if (!canRegister()) {
      const regMessage = getRegistrationMessage();
      if (regMessage?.alert) {
        notification.warning({
          message: regMessage.alert.message,
          description: regMessage.alert.description,
          duration: 5,
          placement: "topRight",
        });
      }
      return;
    }

    setIsRegistering(true);
    try {
      await apiClient.post(`/api/events/${eventId}/register`);

      messageApi.open({
        type: "success",
        duration: 3,
        key: "start-success",
        content: <>Đăng ký tham gia sự kiện thành công!</>,
      });

      setIsRegistered(true);
    } catch (error) {
      console.error("Registration error:", error);

      messageApi.open({
        type: "error",
        duration: 3,
        key: "start-warning",
        content: (
          <>
            {error.response?.data?.message ||
              "Đăng ký thất bại. Vui lòng thử lại sau."}
          </>
        ),
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Get campaign status
  const getCampaignStatus = () => {
    if (!campaign) return null;
    const now = dayjs();
    // Chuyển đổi Unix timestamp (giây) sang milliseconds
    const start = dayjs(campaign.startTime * 1000);
    const end = dayjs(campaign.endTime * 1000);

    if (now.isBefore(start)) {
      return {
        text: "Sắp diễn ra",
        color: "blue",
        icon: <ClockCircleOutlined />,
      };
    } else if (now.isAfter(end)) {
      return {
        text: "Đã kết thúc",
        color: "default",
        icon: <CheckCircleOutlined />,
      };
    } else {
      return {
        text: "Đang diễn ra",
        color: "green",
        icon: <TrophyOutlined />,
      };
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    // Chuyển đổi Unix timestamp (giây) sang milliseconds
    return dayjs(timestamp * 1000).format("DD/MM/YYYY HH:mm");
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Get countdown deadline
  const getCountdownDeadline = () => {
    if (!campaign) return null;
    const now = dayjs();
    // Chuyển đổi Unix timestamp (giây) sang milliseconds
    const start = dayjs(campaign.startTime * 1000);
    const end = dayjs(campaign.endTime * 1000);

    if (now.isBefore(start)) {
      return start.valueOf();
    } else if (now.isBefore(end)) {
      return end.valueOf();
    }
    return null;
  };

  // Render voucher card
  const renderVoucherCard = (voucher, index) => {
    // Chuyển đổi Unix timestamp (giây) sang milliseconds nếu cần
    const expirationDate =
      typeof voucher.expirationDate === "number"
        ? dayjs(voucher.expirationDate * 1000)
        : dayjs(voucher.expirationDate);

    const isExpired = dayjs().isAfter(expirationDate);

    return (
      <Card
        hoverable={!isExpired}
        className={`voucher-card ${
          isExpired ? "opacity-60" : ""
        } shadow-md hover:shadow-xl transition-all duration-300`}
        onClick={() => !isExpired && showVoucherDetail(voucher)}
      >
        <div className="relative">
          {/* Voucher Order Badge */}
          <div className="absolute -top-3 -left-3">
            <Badge
              count={`#${voucher.voucherOrder || index + 1}`}
              style={{
                backgroundColor: "#722ed1",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            />
          </div>

          {/* Expired Badge */}
          {isExpired && (
            <div className="absolute top-0 right-0">
              <Tag color="red">Đã hết hạn</Tag>
            </div>
          )}

          {/* Discount Badge */}
          <div className="text-center mb-4">
            <div className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg px-6 py-3">
              <Text className="text-3xl font-bold text-white">
                {voucher.discountPercentage}%
              </Text>
              <Text className="text-sm block text-white">GIẢM GIÁ</Text>
            </div>
          </div>

          {/* Voucher Code */}
          <div className="text-center mb-3">
            <div className="inline-flex items-center bg-gray-100 rounded-lg px-4 py-2 border-2 border-dashed border-indigo-300">
              <TagOutlined className="text-indigo-600 mr-2" />
              <Text strong className="text-lg tracking-wider">
                {voucher.code}
              </Text>
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyVoucher(voucher.code);
                }}
                className="ml-2"
              />
            </div>
          </div>

          <Divider className="my-3" />

          {/* Voucher Details */}
          <Space direction="vertical" size="small" className="w-full">
            <div className="flex justify-between items-center">
              <Text type="secondary">Hạn sử dụng:</Text>
              <Text strong>{expirationDate.format("DD/MM/YYYY")}</Text>
            </div>
          </Space>

          {/* Action Button */}
          {!isExpired && (
            <Button
              type="primary"
              block
              className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyVoucher(voucher.code);
              }}
            >
              Sao chép mã
            </Button>
          )}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang tải thông tin sự kiện..." />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Empty
          description="Không tìm thấy sự kiện"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate("/events")}>
            Quay lại danh sách
          </Button>
        </Empty>
      </div>
    );
  }

  const status = getCampaignStatus();
  const hasImages =
    campaign.campaignImages && campaign.campaignImages.length > 0;
  const countdownDeadline = getCountdownDeadline();
  const registrationStatus = getRegistrationMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-display">
      {contextHolder}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item href="/">
            <HomeOutlined className="text-lg" />
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/events">
            <span className="text-base">Sự kiện</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <span className="text-base">{campaign.name}</span>
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Back Button */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/events")}
          className="mb-4"
        >
          Quay lại
        </Button>

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Left Column - Images & Info */}
          <Col xs={24} lg={14}>
            <Card className="shadow-lg rounded-xl overflow-hidden">
              {/* Campaign Images */}
              {hasImages && (
                <div className="mb-6">
                  {campaign.campaignImages.length === 1 ? (
                    <Image
                      src={campaign.campaignImages[0].imageUrl}
                      alt={campaign.name}
                      className="w-full rounded-lg"
                      style={{ maxHeight: "500px", objectFit: "cover" }}
                    />
                  ) : (
                    <Carousel autoplay>
                      {campaign.campaignImages.map((img, index) => (
                        <div key={img.id || index}>
                          <img
                            src={img.imageUrl}
                            alt={`${campaign.name} ${index + 1}`}
                            className="w-full rounded-lg"
                            style={{ height: "500px", objectFit: "cover" }}
                          />
                        </div>
                      ))}
                    </Carousel>
                  )}
                </div>
              )}

              {/* Campaign Title & Status */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-3">
                  <Title level={2} className="mb-0">
                    {campaign.name}
                  </Title>
                  <Tag
                    color={status.color}
                    icon={status.icon}
                    className="text-base px-4 py-1"
                  >
                    {status.text}
                  </Tag>
                </div>
              </div>

              <Divider />

              {/* Campaign Timeline */}
              <div className="mb-6">
                <Title level={4} className="mb-4">
                  <CalendarOutlined className="mr-2" />
                  Thời gian diễn ra
                </Title>
                <Timeline
                  items={[
                    {
                      color: "green",
                      children: (
                        <div>
                          <Text strong>Bắt đầu:</Text>
                          <br />
                          <Text className="text-lg">
                            {formatDate(campaign.startTime)}
                          </Text>
                          <br />
                          <Text type="secondary">
                            {dayjs(campaign.startTime).fromNow()}
                          </Text>
                        </div>
                      ),
                    },
                    {
                      color: "red",
                      children: (
                        <div>
                          <Text strong>Kết thúc:</Text>
                          <br />
                          <Text className="text-lg">
                            {formatDate(campaign.endTime)}
                          </Text>
                          <br />
                          <Text type="secondary">
                            {dayjs(campaign.endTime).fromNow()}
                          </Text>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              {/* Countdown */}
              {countdownDeadline && (
                <Alert
                  message={
                    <div className="text-center">
                      <Text strong className="text-lg">
                        {status.text === "Sắp diễn ra"
                          ? "Sự kiện bắt đầu sau:"
                          : "Sự kiện kết thúc sau:"}
                      </Text>
                      <Countdown
                        value={countdownDeadline}
                        format="D ngày H giờ m phút s giây"
                        valueStyle={{ fontSize: "24px", color: "#f5222d" }}
                      />
                    </div>
                  }
                  type="warning"
                  showIcon
                  icon={<ClockCircleOutlined />}
                  className="mb-6"
                />
              )}

              {/* Campaign Details */}
              <Descriptions
                title={
                  <Title level={4}>
                    <TrophyOutlined className="mr-2" />
                    Thông tin chi tiết
                  </Title>
                }
                bordered
                column={1}
              >
                <Descriptions.Item label="Mã sự kiện">
                  <Text code>{campaign.id}</Text>
                </Descriptions.Item>
                {campaign.game.name && (
                  <Descriptions.Item label="Game ID">
                    <Text code>{campaign.game.name}</Text>
                  </Descriptions.Item>
                )}
                {campaign.questionCollectionName && (
                  <Descriptions.Item label="Bộ câu hỏi">
                    <Text code>{campaign.questionCollectionName}</Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Số lượng voucher">
                  <Badge
                    count={campaign.vouchers?.length || 0}
                    showZero
                    style={{ backgroundColor: "#52c41a" }}
                  />
                </Descriptions.Item>
              </Descriptions>

              {/* Register Event Section */}
              <Divider />
              <div className="register-section py-6">
                <div className="text-center mb-4">
                  <Title level={3} className="mb-2">
                    🎮 Tham gia ngay!
                  </Title>
                  <Paragraph className="text-gray-600 text-lg">
                    Đăng ký để nhận voucher và tham gia trò chơi
                  </Paragraph>
                  {/* Warning message for time restriction */}
                  {registrationStatus?.disabled && !isRegistered && (
                    <Alert
                      message="Lưu ý về thời gian đăng ký"
                      description="Bạn cần đăng ký trước 5 phút trước khi sự kiện bắt đầu"
                      type="warning"
                      showIcon
                      className="mb-4"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "2px solid #faad14",
                      }}
                    />
                  )}
                </div>

                {isRegistered ? (
                  <Alert
                    message="Bạn đã đăng ký tham gia sự kiện này"
                    description="Chúc bạn chơi game vui vẻ và may mắn!"
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    className="register-success-alert"
                  />
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    icon={<TrophyOutlined />}
                    loading={isRegistering}
                    onClick={handleRegisterEvent}
                    disabled={registrationStatus?.disabled}
                    className="register-button"
                    block
                  >
                    {registrationStatus?.text}
                  </Button>
                )}
              </div>
            </Card>
          </Col>

          {/* Right Column - Vouchers */}
          <Col xs={24} lg={10}>
            <Card
              className="shadow-lg rounded-xl"
              title={
                <div className="flex items-center">
                  <GiftOutlined className="text-2xl text-pink-500 mr-2" />
                  <Title
                    level={3}
                    className="mb-0"
                    style={{
                      marginBottom: "0",
                    }}
                  >
                    Danh sách Voucher ({campaign.vouchers?.length || 0})
                  </Title>
                </div>
              }
            >
              {campaign.vouchers && campaign.vouchers.length > 0 ? (
                <Space direction="vertical" size="large" className="w-full">
                  {campaign.vouchers
                    .sort(
                      (a, b) => (a.voucherOrder || 0) - (b.voucherOrder || 0)
                    )
                    .map((voucher, index) => (
                      <div key={voucher.id}>
                        {renderVoucherCard(voucher, index)}
                      </div>
                    ))}
                </Space>
              ) : (
                <Empty
                  description="Chưa có voucher nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* Voucher Detail Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <GiftOutlined className="text-pink-500 mr-2" />
            Chi tiết Voucher
          </div>
        }
        open={isVoucherModalVisible}
        onCancel={() => setIsVoucherModalVisible(false)}
        footer={[
          <Button
            key="copy"
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => {
              handleCopyVoucher(selectedVoucher.code);
              setIsVoucherModalVisible(false);
            }}
          >
            Sao chép mã
          </Button>,
        ]}
      >
        {selectedVoucher && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã Voucher">
              <Text strong code className="text-lg">
                {selectedVoucher.code}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Giảm giá">
              <Text strong className="text-red-600 text-lg">
                {selectedVoucher.discountPercentage}%
              </Text>
            </Descriptions.Item>
            {selectedVoucher.value && (
              <Descriptions.Item label="Giá trị giảm">
                {formatCurrency(selectedVoucher.value)}
              </Descriptions.Item>
            )}
            {selectedVoucher.maxValue && (
              <Descriptions.Item label="Giảm tối đa">
                <Text strong className="text-red-600">
                  {formatCurrency(selectedVoucher.maxValue)}
                </Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Hạn sử dụng">
              {formatDate(selectedVoucher.expirationDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Thứ tự">
              #{selectedVoucher.voucherOrder}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
      <style jsx>{`
        .voucher-card {
          border-radius: 16px;
          border: 2px solid #f0f0f0;
        }
        .voucher-card:hover {
          border-color: #722ed1;
        }

        .register-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 2rem;
          margin-top: 1rem;
          position: relative;
          overflow: hidden;
        }

        .register-section::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 70%
          );
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        .register-section h3 {
          color: white !important;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .register-section p {
          color: rgba(255, 255, 255, 0.95) !important;
        }

        .register-button {
          height: 60px !important;
          font-size: 18px !important;
          font-weight: bold !important;
          letter-spacing: 1px;
          background: linear-gradient(
            90deg,
            #f093fb 0%,
            #f5576c 100%
          ) !important;
          border: none !important;
          box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4) !important;
          transition: all 0.3s ease !important;
          position: relative;
          overflow: hidden;
        }

        .register-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.5s;
        }

        .register-button:hover::before {
          left: 100%;
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-3px) !important;
          box-shadow: 0 12px 28px rgba(245, 87, 108, 0.6) !important;
        }

        .register-button:active:not(:disabled) {
          transform: translateY(-1px) !important;
        }

        .register-button:disabled {
          background: linear-gradient(
            90deg,
            #d9d9d9 0%,
            #bfbfbf 100%
          ) !important;
          box-shadow: none !important;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .register-success-alert {
          border-radius: 12px !important;
          padding: 20px !important;
          font-size: 16px !important;
          background: linear-gradient(
            135deg,
            #43e97b 0%,
            #38f9d7 100%
          ) !important;
          border: none !important;
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .register-button:not(:disabled) .anticon {
          animation: bounce 2s ease-in-out infinite;
        }

        .register-button:active::after {
          width: 300px;
          height: 300px;
          opacity: 0;
          transition: 0s;
        }
      `}</style>
    </div>
  );
};

export default EventDetail;
