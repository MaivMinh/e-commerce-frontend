import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GiftOutlined,
  HomeOutlined,
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
        error.response?.data?.message || "Không thể tải thông tin sự kiện này.",
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

  // Show voucher detail modal
  const showVoucherDetail = (voucher) => {
    setSelectedVoucher(voucher);
    setIsVoucherModalVisible(true);
  };

  const canRegister = () => {
    if (!campaign) return false;

    const now = dayjs();
    const start = parseDayjsFromTimestamp(campaign.startTime);
    const end = parseDayjsFromTimestamp(campaign.endTime);

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

  const canPlayGame = () => {
    if (!campaign || !isRegistered) return false;

    const now = dayjs();
    const start = parseDayjsFromTimestamp(campaign.startTime);
    const end = parseDayjsFromTimestamp(campaign.endTime);

    if (now.isAfter(end)) {
      return false;
    }

    // Chỉ cho phép chơi nếu sự kiện đã bắt đầu hoặc trong vòng 5 phút trước khi bắt đầu
    const minutesUntilStart = start.diff(now, "minute");
    return true;
  };

  const getPlayGameStatus = () => {
    if (!campaign) return null;

    if (!isRegistered) {
      return {
        canPlay: false,
        message: "Bạn cần đăng ký trước khi tham gia",
      };
    }

    const now = dayjs();
    const start = parseDayjsFromTimestamp(campaign.startTime);
    const end = parseDayjsFromTimestamp(campaign.endTime);

    if (now.isAfter(end)) {
      return {
        canPlay: false,
        message: "Sự kiện đã kết thúc",
      };
    }

    let minutesUntilStart = start.diff(now, "minute");

    if (minutesUntilStart > 5) {
      return {
        canPlay: false,
        message: `Trò chơi sẽ mở sau ${minutesUntilStart} phút`,
      };
    }

    if (minutesUntilStart > 0) {
      return {
        canPlay: true,
        message: `Trò chơi sắp bắt đầu! (${minutesUntilStart} phút nữa)`,
        urgent: true,
      };
    }

    return {
      canPlay: true,
      message: "Trò chơi đang diễn ra!",
      active: true,
    };
  };

  // Thêm hàm: Xử lý khi nhấn tham gia chơi
  const handlePlayGame = () => {
    if (!canPlayGame()) {
      const playStatus = getPlayGameStatus();
      messageApi.warning(playStatus?.message || "Chưa thể tham gia chơi");
      return;
    }

    navigate(`/events/play/${eventId}`);
  };

  // Get registration message - Cập nhật để xử lý isRegistered
  const getRegistrationMessage = () => {
    if (!campaign) return null;

    const now = dayjs();
    const start = parseDayjsFromTimestamp(campaign.startTime);
    const end = parseDayjsFromTimestamp(campaign.endTime);
    const minutesUntilStart = start.diff(now, "minute");

    // Đã kết thúc
    if (now.isAfter(end)) {
      return {
        disabled: true,
        text: "Sự kiện đã kết thúc",
        type: "default",
        showAlert: false,
      };
    }

    // Nếu đã đăng ký và có thể chơi game (trong vòng 5 phút hoặc đang diễn ra)
    if (isRegistered && minutesUntilStart <= 5 && minutesUntilStart >= -9999) {
      return {
        disabled: false,
        text: "THAM GIA CHƠI NGAY",
        type: "primary",
        showAlert: false,
        isPlayButton: true,
      };
    }

    // Nếu đã đăng ký rồi nhưng chưa đến giờ chơi
    if (isRegistered) {
      return {
        disabled: true,
        text: "Đã đăng ký",
        type: "success",
        showAlert: false,
      };
    }

    // Đã bắt đầu nhưng chưa đăng ký
    if (now.isAfter(start)) {
      return {
        disabled: true,
        text: "Trò chơi đã bắt đầu",
        type: "warning",
        showAlert: false,
      };
    }

    // Kiểm tra thời gian còn lại
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
    const start = parseDayjsFromTimestamp(campaign.startTime);
    const end = parseDayjsFromTimestamp(campaign.endTime);

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

  const parseDayjsFromTimestamp = (timestamp) => {
    if (!timestamp) return null;

    // Nếu timestamp là string
    if (typeof timestamp === "string") {
      return dayjs(timestamp);
    }

    // Nếu timestamp là number
    if (typeof timestamp === "number") {
      // Kiểm tra xem đã là milliseconds hay chưa
      // Unix timestamp giây thường < 10^10 (< 10 tỷ)
      // Nếu nhỏ hơn 10^11 (100 tỷ), coi như là giây
      const isSeconds = timestamp < 100000000000;
      return dayjs(isSeconds ? timestamp * 1000 : timestamp);
    }

    return null;
  };

  // Format date
  const formatDate = (timestamp) => {
    console.log("formatDate input:", timestamp, "type:", typeof timestamp);
    const date = parseDayjsFromTimestamp(timestamp);
    return date && date.isValid()
      ? date.format("DD/MM/YYYY HH:mm")
      : "Invalid Date";
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
    const start = parseDayjsFromTimestamp(campaign.startTime);
    const end = parseDayjsFromTimestamp(campaign.endTime);

    if (now.isBefore(start)) {
      return start.valueOf();
    } else if (now.isBefore(end)) {
      return end.valueOf();
    }
    return null;
  };

  // Render voucher card
  const renderVoucherCard = (voucher, index) => {
    const expirationDate = parseDayjsFromTimestamp(voucher.endDate);
    const isExpired = dayjs().isAfter(expirationDate);

    // Mảng màu gradient đa dạng và đẹp mắt
    const gradientColors = [
      { from: "#FF6B6B", to: "#FF8E53", badge: "#FF6B6B", name: "Sunset" },
      { from: "#4FACFE", to: "#00F2FE", badge: "#4FACFE", name: "Ocean" },
      { from: "#43E97B", to: "#38F9D7", badge: "#43E97B", name: "Mint" },
      { from: "#FA709A", to: "#FEE140", badge: "#FA709A", name: "Peach" },
      { from: "#A8EDEA", to: "#FED6E3", badge: "#A8EDEA", name: "Cotton" },
      { from: "#FF9A9E", to: "#FECFEF", badge: "#FF9A9E", name: "Rose" },
      { from: "#667EEA", to: "#764BA2", badge: "#667EEA", name: "Purple" },
      { from: "#F093FB", to: "#F5576C", badge: "#F093FB", name: "Candy" },
      { from: "#4FACFE", to: "#43E97B", badge: "#4FACFE", name: "Aqua" },
      { from: "#FA8BFF", to: "#2BD2FF", badge: "#FA8BFF", name: "Dream" },
    ];

    const colorScheme = gradientColors[index % gradientColors.length];

    return (
      <Card
        hoverable={!isExpired}
        className={`voucher-card-animated ${
          isExpired ? "opacity-60" : ""
        } shadow-lg hover:shadow-2xl transition-all duration-300`}
        style={{
          background: isExpired
            ? "linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)"
            : `linear-gradient(135deg, ${colorScheme.from} 0%, ${colorScheme.to} 100%)`,
          border: "none",
          borderRadius: "20px",
          overflow: "hidden",
        }}
        onClick={() => !isExpired && showVoucherDetail(voucher)}
      >
        <div className="relative p-2">
          {/* Voucher Order Badge */}
          <div className="absolute -top-5 -left-5 z-10">
            <Badge
              count={`#${voucher.voucherOrder || index + 1}`}
              style={{
                backgroundColor: isExpired ? "#9E9E9E" : colorScheme.badge,
                fontSize: "14px",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            />
          </div>

          {/* Expired Badge */}
          {isExpired && (
            <div className="absolute top-2 right-2 z-10">
              <Tag color="red" style={{ fontWeight: "bold" }}>
                Đã hết hạn
              </Tag>
            </div>
          )}

          {/* Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white"></div>
          </div>

          {/* Voucher Title */}
          {voucher.discountPercentage && voucher.discountPercentage > 0 ? (
            <div className="text-center mb-4 relative z-5">
              <div className="inline-block bg-white rounded-2xl px-8 py-4 shadow-lg">
                <Text
                  className="text-4xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${colorScheme.from} 0%, ${colorScheme.to} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {voucher.discountPercentage}%
                </Text>
              </div>
            </div>
          ) : (
            <div className="text-center mb-4 relative z-5">
              <div className="inline-block bg-white rounded-2xl px-8 py-4 shadow-lg">
                <Text
                  className="text-4xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${colorScheme.from} 0%, ${colorScheme.to} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {formatCurrency(voucher.value)}
                </Text> 
              </div>
            </div>
          )}

          <Divider className="my-3 bg-white opacity-30" />

          {/* Voucher Details */}
          <div className="relative z-5 bg-white rounded-xl p-4 shadow-inner">
            <Space direction="vertical" size="small" className="w-full">
              <div className="flex justify-between items-center">
                <Text className="text-gray-600 font-medium">
                  <CalendarOutlined className="mr-2" />
                  Hạn sử dụng:
                </Text>
                <Text strong className="text-gray-800">
                  {formatDate(voucher?.expirationDate)}
                </Text>
              </div>

              {voucher.maxValue && (
                <div className="flex justify-between items-center">
                  <Text className="text-gray-600 font-medium">
                    <GiftOutlined className="mr-2" />
                    Giảm tối đa:
                  </Text>
                  <Text strong className="text-red-600">
                    {formatCurrency(voucher.maxValue)}
                  </Text>
                </div>
              )}
            </Space>
          </div>
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
                            {parseDayjsFromTimestamp(
                              campaign.startTime,
                            )?.fromNow()}
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
                            {parseDayjsFromTimestamp(
                              campaign.endTime,
                            )?.fromNow()}
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
                    {registrationStatus?.isPlayButton
                      ? "🎮 Tham gia chơi!"
                      : "🎮 Tham gia ngay!"}
                  </Title>
                  <Paragraph className="text-gray-600 text-lg">
                    {registrationStatus?.isPlayButton
                      ? "Trò chơi đã sẵn sàng! Nhấn nút để bắt đầu"
                      : "Đăng ký để nhận voucher và tham gia trò chơi"}
                  </Paragraph>

                  {/* Warning message for time restriction */}
                  {registrationStatus?.disabled &&
                    !isRegistered &&
                    !registrationStatus?.isPlayButton && (
                      <Alert
                        message="Lưu ý về thời gian đăng ký"
                        description="Bạn cần đăng ký trước 5 phút trước khi trò chơi bắt đầu"
                        type="warning"
                        showIcon
                        className="mb-4"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          border: "2px solid #faad14",
                        }}
                      />
                    )}

                  {/* Info message when ready to play */}
                  {registrationStatus?.isPlayButton && (
                    <Alert
                      message={getPlayGameStatus()?.message}
                      description="Chúc bạn chơi game vui vẻ và giành được nhiều phần quà!"
                      type="success"
                      showIcon
                      icon={<TrophyOutlined />}
                      className="mb-4 play-ready-alert"
                    />
                  )}
                </div>

                {isRegistered && !registrationStatus?.isPlayButton ? (
                  <Alert
                    message="Bạn đã đăng ký tham gia sự kiện này"
                    description={
                      canPlayGame()
                        ? "Trò chơi sắp bắt đầu! Vui lòng đợi..."
                        : `Chờ đợi trò chơi bắt đầu. Bạn có thể tham gia chơi trong vòng 5 phút trước khi sự kiện diễn ra.`
                    }
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
                    onClick={
                      registrationStatus?.isPlayButton
                        ? handlePlayGame
                        : handleRegisterEvent
                    }
                    disabled={registrationStatus?.disabled}
                    className={
                      registrationStatus?.isPlayButton
                        ? "play-button"
                        : "register-button"
                    }
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
                      (a, b) => (a.voucherOrder || 0) - (b.voucherOrder || 0),
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
            <GiftOutlined className="text-pink-500 mr-2 text-xl" />
            <span className="text-lg font-bold">Chi tiết Voucher</span>
          </div>
        }
        open={isVoucherModalVisible}
        onCancel={() => setIsVoucherModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsVoucherModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedVoucher && (
          <div>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Giảm giá">
                {selectedVoucher.discountPercentage &&
                selectedVoucher.discountPercentage > 0 ? (
                  <Text strong className="text-red-600 text-lg">
                    {selectedVoucher.discountPercentage}%
                  </Text>
                ) : (
                  <Text strong className="text-gray-500">
                    Không có
                  </Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Giá trị giảm cố định">
                {selectedVoucher.value && selectedVoucher.value > 0 ? (
                  <Text strong className="text-red-600 text-lg">
                    {formatCurrency(selectedVoucher.value)}
                  </Text>
                ) : (
                  <Text strong className="text-gray-500">
                    Không có
                  </Text>
                )}
              </Descriptions.Item>
              {selectedVoucher.maxValue && (
                <Descriptions.Item label="Giảm tối đa">
                  <Text strong className="text-red-600">
                    {formatCurrency(selectedVoucher.maxValue)}
                  </Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Hạn sử dụng">
                <Text strong>{formatDate(selectedVoucher.expirationDate)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thứ tự">
                <Badge
                  count={`#${selectedVoucher.voucherOrder}`}
                  style={{ backgroundColor: "#FA709A" }}
                />
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
      <style jsx>{`
        .voucher-card-animated {
          border-radius: 20px;
          border: none;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }

        .voucher-card-animated:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
        }

        .voucher-card-animated::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 70%
          );
          animation: shimmer 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes shimmer {
          0%,
          100% {
            transform: translate(-20%, -20%) scale(1);
            opacity: 0;
          }
          50% {
            transform: translate(0%, 0%) scale(1.1);
            opacity: 0.3;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .voucher-card-animated {
          animation: fadeInUp 0.5s ease-out forwards;
        }

        .voucher-card-animated:nth-child(1) {
          animation-delay: 0.1s;
        }
        .voucher-card-animated:nth-child(2) {
          animation-delay: 0.2s;
        }
        .voucher-card-animated:nth-child(3) {
          animation-delay: 0.3s;
        }
        .voucher-card-animated:nth-child(4) {
          animation-delay: 0.4s;
        }
        .voucher-card-animated:nth-child(5) {
          animation-delay: 0.5s;
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

        .play-button {
          height: 60px !important;
          font-size: 18px !important;
          font-weight: bold !important;
          letter-spacing: 1px;
          background: linear-gradient(
            90deg,
            #11998e 0%,
            #38ef7d 100%
          ) !important;
          border: none !important;
          box-shadow: 0 8px 20px rgba(56, 239, 125, 0.4) !important;
          transition: all 0.3s ease !important;
          position: relative;
          overflow: hidden;
          animation: playPulse 1.5s ease-in-out infinite;
        }

        @keyframes playPulse {
          0%,
          100% {
            box-shadow: 0 8px 20px rgba(56, 239, 125, 0.4);
          }
          50% {
            box-shadow: 0 12px 28px rgba(56, 239, 125, 0.8);
          }
        }

        .register-button::before,
        .play-button::before {
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

        .register-button:hover::before,
        .play-button:hover::before {
          left: 100%;
        }

        .register-button:hover:not(:disabled),
        .play-button:hover:not(:disabled) {
          transform: translateY(-3px) !important;
        }

        .register-button:hover:not(:disabled) {
          box-shadow: 0 12px 28px rgba(245, 87, 108, 0.6) !important;
        }

        .play-button:hover:not(:disabled) {
          box-shadow: 0 12px 28px rgba(56, 239, 125, 0.8) !important;
        }

        .register-button:active:not(:disabled),
        .play-button:active:not(:disabled) {
          transform: translateY(-1px) !important;
        }

        .register-button:disabled,
        .play-button:disabled {
          background: linear-gradient(
            90deg,
            #d9d9d9 0%,
            #bfbfbf 100%
          ) !important;
          box-shadow: none !important;
          cursor: not-allowed;
          opacity: 0.7;
          animation: none;
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

        .play-ready-alert {
          border-radius: 12px !important;
          padding: 16px !important;
          background: linear-gradient(
            135deg,
            #ffeaa7 0%,
            #fdcb6e 100%
          ) !important;
          border: 2px solid #f39c12 !important;
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

        .register-button:not(:disabled) .anticon,
        .play-button:not(:disabled) .anticon {
          animation: bounce 2s ease-in-out infinite;
        }

        .register-button:active::after,
        .play-button:active::after {
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
