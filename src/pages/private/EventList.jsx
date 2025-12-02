import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Input,
  DatePicker,
  Button,
  Pagination,
  Empty,
  Spin,
  Typography,
  Tag,
  Badge,
  Space,
  Image,
  Carousel,
  Divider,
  notification,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  GiftOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  RightOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import apiClient from "../../services/apiClient";
import dayjs from "dayjs";
import "dayjs/locale/vi";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

const EventList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalElements, setTotalElements] = useState(0);

  // Search filters
  const [searchName, setSearchName] = useState("");
  const [dateRange, setDateRange] = useState(null);

  // Fetch campaigns
  const fetchCampaigns = async (page = 1) => {
    setLoading(true);
    try {
      const payload = {
        page: page - 1,
        size: pageSize,
        name: searchName || null,
        fromStartTime: dateRange?.[0]
          ? dateRange[0].startOf("day").toISOString()
          : null,
        toStartTime: dateRange?.[1]
          ? dateRange[1].endOf("day").toISOString()
          : null,
      };

      const response = await apiClient.post("/api/campaigns/search", payload);
      const data = response.data.data;

      setCampaigns(data.content || []);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(page);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh sách sự kiện",
      });
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(1);
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchCampaigns(1);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchName("");
    setDateRange(null);
    setTimeout(() => fetchCampaigns(1), 0);
  };

  // Handle pagination
  const handlePageChange = (page, size) => {
    setPageSize(size);
    fetchCampaigns(page);
  };

  // Navigate to campaign detail
  const navigateToCampaign = (campaignId) => {
    navigate(`/events/${campaignId}`);
  };

  // Format date
  const formatDate = (dateString) => {
    return dayjs(dateString).locale("vi").format("DD/MM/YYYY");
  };

  // Check if campaign is active
  const isCampaignActive = (campaign) => {
    const now = dayjs();
    const start = dayjs(campaign.startTime);
    const end = dayjs(campaign.endTime);
    return now.isAfter(start) && now.isBefore(end);
  };

  // Get campaign status
  const getCampaignStatus = (campaign) => {
    const now = dayjs();
    const start = dayjs(campaign.startTime);
    const end = dayjs(campaign.endTime);

    if (now.isBefore(start)) {
      return { text: "Sắp diễn ra", color: "blue" };
    } else if (now.isAfter(end)) {
      return { text: "Đã kết thúc", color: "default" };
    } else {
      return { text: "Đang diễn ra", color: "green" };
    }
  };

  // Render campaign card
  const renderCampaignCard = (campaign) => {
    const status = getCampaignStatus(campaign);
    const hasImages =
      campaign.campaignImages && campaign.campaignImages.length > 0;
    const defaultImage = "https://via.placeholder.com/400x250?text=No+Image";

    return (
      <Card
        hoverable
        style={{
          marginTop: "32px",
        }}
        className="campaign-card h-full shadow-sm hover:shadow-xl transition-all duration-500 rounded-lg overflow-hidden"
        onClick={() => navigateToCampaign(campaign.id)}
        cover={
          <div className="relative h-56 overflow-hidden bg-gray-100">
            {hasImages ? (
              campaign.campaignImages.length === 1 ? (
                <img
                  src={campaign.campaignImages[0].imageUrl}
                  alt={campaign.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Carousel autoplay>
                  {campaign.campaignImages.map((img, index) => (
                    <div key={img.id || index} className="h-56">
                      <img
                        src={img.imageUrl}
                        alt={`${campaign.name} ${index + 1}`}
                        className="w-full h-56 object-cover"
                      />
                    </div>
                  ))}
                </Carousel>
              )
            ) : (
              <img
                src={defaultImage}
                alt={campaign.name}
                className="w-full h-full object-cover"
              />
            )}

            {/* Status badge */}
            <div className="absolute top-3 right-3">
              <Badge
                count={status.text}
                style={{
                  backgroundColor:
                    status.color === "green"
                      ? "#52c41a"
                      : status.color === "blue"
                      ? "#1890ff"
                      : "#d9d9d9",
                }}
              />
            </div>

            {/* Voucher count badge */}
            {campaign.vouchers && campaign.vouchers.length > 0 && (
              <div className="absolute top-3 left-3">
                <Tag icon={<GiftOutlined />} color="magenta">
                  {campaign.vouchers.length} voucher
                </Tag>
              </div>
            )}
          </div>
        }
      >
        <div className="p-2">
          <Title level={4} ellipsis={{ rows: 2 }} className="mb-2 h-14">
            {campaign.name}
          </Title>

          <Divider className="my-3" />

          <Space direction="vertical" size="small" className="w-full">
            <div className="flex items-center text-gray-600">
              <CalendarOutlined className="mr-2" />
              <Text className="text-sm">
                {formatDate(campaign.startTime)} -{" "}
                {formatDate(campaign.endTime)}
              </Text>
            </div>

            {campaign.vouchers && campaign.vouchers.length > 0 && (
              <div className="flex items-start text-gray-600">
                <GiftOutlined className="mr-2 mt-1" />
                <div className="flex-1">
                  <Text className="text-sm">
                    Giảm tới{" "}
                    <Text strong className="text-red-600">
                      {Math.max(
                        ...campaign.vouchers.map(
                          (v) => v.discountPercentage || 0
                        )
                      )}
                      %
                    </Text>
                  </Text>
                </div>
              </div>
            )}
          </Space>

          <Button
            type="primary"
            block
            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
            icon={<RightOutlined />}
            iconPosition="end"
          >
            Xem chi tiết
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 font-display">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="flex items-center mb-2">
            <TrophyOutlined className="mr-3 text-yellow-500" />
            Sự kiện & Khuyến mãi
          </Title>
          <Paragraph className="text-gray-600 text-lg">
            Khám phá các chương trình khuyến mãi hấp dẫn và nhận voucher giảm
            giá
          </Paragraph>
        </div>

        {/* Search & Filter Section */}
        <Card className="mb-6 shadow-sm">
          <Space
            direction="vertical"
            size="middle"
            className="w-full"
            wrap={false}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12} lg={10}>
                <Search
                  placeholder="Tìm kiếm tên sự kiện..."
                  allowClear
                  enterButton={
                    <Button type="primary" icon={<SearchOutlined />}>
                      Tìm kiếm
                    </Button>
                  }
                  size="large"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onSearch={handleSearch}
                />
              </Col>
              <Col xs={24} sm={24} md={12} lg={10}>
                <RangePicker
                  size="large"
                  className="w-full"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  format="DD/MM/YYYY"
                  value={dateRange}
                  onChange={setDateRange}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={4}>
                <Button
                  size="large"
                  icon={<ClearOutlined />}
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Xóa bộ lọc
                </Button>
              </Col>
            </Row>
          </Space>
        </Card>

        {/* Campaign Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" tip="Đang tải sự kiện..." />
          </div>
        ) : campaigns.length > 0 ? (
          <>
            <Row gutter={[24, 24]}>
              {campaigns.map((campaign) => (
                <Col xs={24} sm={12} lg={8} key={campaign.id}>
                  {renderCampaignCard(campaign)}
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {totalElements > pageSize && (
              <div className="flex justify-center mt-8">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalElements}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total) => `Tổng ${total} sự kiện`}
                  pageSizeOptions={["6", "9", "12", "18"]}
                />
              </div>
            )}
          </>
        ) : (
          <Card className="shadow-sm">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-500 text-lg">
                  {searchName || dateRange
                    ? "Không tìm thấy sự kiện phù hợp"
                    : "Chưa có sự kiện nào"}
                </span>
              }
            >
              {(searchName || dateRange) && (
                <Button type="primary" onClick={handleClearFilters}>
                  Xóa bộ lọc
                </Button>
              )}
            </Empty>
          </Card>
        )}
      </div>

      <style jsx>{`
        .campaign-card {
          border-radius: 12px;
        }
        .campaign-card:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
};

export default EventList;
