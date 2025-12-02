import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Pagination,
  Spin,
  Empty,
  Typography,
  Space,
  Drawer,
  Divider,
  Image,
  Badge,
  Alert,
  Card,
  Input,
  Select,
} from "antd";
import {
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  SyncOutlined,
  DollarOutlined,
  FileTextOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import apiClient from "../../services/apiClient";
import dayjs from "dayjs";
import "dayjs/locale/vi";

const { Title, Text } = Typography;
const { Search } = Input;
const statusOptions = [
  { label: "CREATED", value: "CREATED" },
  { label: "CONFIRMED", value: "CONFIRMED" },
  { label: "DELIVERED", value: "DELIVERED" },
  { label: "SUCCESS", value: "SUCCESS" },
  { label: "CANCELLED", value: "CANCELLED" },
  { label: "ROLLBACK", value: "ROLLBACK" },
];

const Order = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [product, setProduct] = useState(null);

  const fetchOrders = async (
    page = currentPage,
    size = pageSize,
    keyword = null,
    status = null
  ) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/api/orders/search", {
        page: page,
        size: size,
        keyword: keyword,
        status: status,
      });

      const data = response.data.data;
      setOrders(data.orders || []);
      setFilteredOrders(data.orders || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
      setPageSize(data.size || 10);
      setCurrentPage(data.page || 1);
      setError(null);
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải danh sách đơn hàng");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  

  // Handle client-side search
  const handleSearch = (value) => {
    setSearchText(value);

    if (!value.trim()) {
      // If search is empty, show all orders
      setFilteredOrders(orders);
      return;
    }

    // Convert search to lowercase for case-insensitive comparison
    const searchLower = value.toLowerCase();

    const response = apiClient.post("/api/orders/search", {
      page: 1,
      size: 10,
      keyword: searchLower,
    });

    response
      .then((res) => {
        const data = res.data.data;
        setFilteredOrders(data.orders || []);
      })
      .catch((err) => {
        setError("Đã xảy ra lỗi khi tìm kiếm đơn hàng");
        setFilteredOrders([]);
      });
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    // pass current searchText as keyword if present
    if (searchText && searchText.trim()) {
      fetchOrders(page, pageSize, searchText.trim(), status);
    } else {
      fetchOrders(page, pageSize,null, status);
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).locale("vi").format("DD/MM/YYYY HH:mm");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusTag = (status) => {
    console.log("get status tag");
    switch (status) {
      case "completed":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Hoàn thành
          </Tag>
        );
      case "processing":
        return (
          <Tag color="processing" icon={<SyncOutlined spin />}>
            Đang xử lý
          </Tag>
        );
      case "shipped":
        return (
          <Tag color="blue" icon={<InboxOutlined />}>
            Đang giao
          </Tag>
        );
      case "pending":
        return (
          <Tag color="warning" icon={<ClockCircleOutlined />}>
            Chờ xử lý
          </Tag>
        );
      case "failed":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Thất bại
          </Tag>
        );
      case "cancelled":
        return (
          <Tag color="default" icon={<CloseCircleOutlined />}>
            Đã hủy
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getPaymentStatusTag = (status) => {
    switch (status) {
      case "completed":
        return (
          <Tag color="success" icon={<DollarOutlined />}>
            Đã thanh toán
          </Tag>
        );
      case "pending":
        return (
          <Tag color="warning" icon={<ClockCircleOutlined />}>
            Chờ thanh toán
          </Tag>
        );
      case "failed":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Thanh toán thất bại
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const viewOrderDetail = (order) => {
    setViewingOrder(order);
    setDrawerVisible(true);
  };

  const searchOrderByStatus = (order, status) => {
    const response = apiClient.post("/api/orders/search", {
      page: 1,
      size: 10,
      keyword: searchText.trim() || null,
      status: status,
    });

    response
      .then((res) => {
        const data = res.data.data;
        setFilteredOrders(data.orders || []);
        return true;
      })
      .catch((err) => {
        setError("Đã xảy ra lỗi khi lọc đơn hàng theo trạng thái");
        setFilteredOrders([]);
      });
    return false;
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: (id) => (
        <span className="font-medium">{id.substring(0, 8)}...</span>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total) => (
        <span className="font-medium text-red-600">{formatPrice(total)}</span>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => getPaymentStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => viewOrderDetail(record)}
          className="text-indigo-600 flex items-center"
        >
          Chi tiết <RightOutlined />
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-display">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="m-0">
            Đơn hàng của tôi
          </Title>
          <Text className="text-gray-500">{totalElements} đơn hàng</Text>
        </div>

        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}
        {/* Add status filter and search in one row */}
        <div className="max-w-full flex flex-row justify-between items-center mb-4 gap-4">
          <Select
            allowClear
            placeholder="Chọn trạng thái"
            size="large"
            value={status}
            onChange={(value) => {
              setStatus(value || null);
              setCurrentPage(1);
              const kw =
                searchText && searchText.trim() ? searchText.trim() : null;
              fetchOrders(1, pageSize, kw, value || null);
            }}
            options={[
              { label: "Tất cả", value: null },
              { label: "Đã tạo", value: "CREATED" },
              { label: "Đã xác nhận", value: "CONFIRMED" },
              { label: "Đã giao", value: "DELIVERED" },
              { label: "Thành công", value: "SUCCESS" },
              { label: "Thất bại", value: "CANCELLED" },
              { label: "Đã hủy", value: "ROLLBACK" },
            ]}
            style={{ width: 200 }}
          />

          <Search
            placeholder="Tìm kiếm theo mã đơn hàng hoặc sản phẩm"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={(value) => {
              const kw = (value || "").trim();
              setSearchText(kw);
              setCurrentPage(1);
              fetchOrders(1, pageSize, kw, status);
            }}
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            style={{
              width: "50%",
            }}
          />
        </div>

        <Card className="shadow-sm rounded-lg">
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            loading={loading}
            pagination={false}
            locale={{
              emptyText: searchText ? (
                <Empty
                  description={`Không tìm thấy đơn hàng với từ khóa "${searchText}"`}
                />
              ) : (
                <Empty description="Không có đơn hàng nào" />
              ),
            }}
            className="bg-white rounded-lg overflow-hidden"
          />

          {totalElements > 0 && (
            <div className="flex justify-end mt-4">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalElements}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `Tổng ${total} đơn hàng`}
              />
            </div>
          )}
        </Card>
      </div>

      {/* Order Detail Drawer */}
      <Drawer
        title={
          viewingOrder ? (
            <div className="flex items-center">
              <ShoppingOutlined className="mr-2 text-indigo-600" />
              <span>Chi tiết đơn hàng #{viewingOrder.id.substring(0, 8)}</span>
            </div>
          ) : (
            "Chi tiết đơn hàng"
          )
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={520}
        extra={viewingOrder && getStatusTag(viewingOrder.status)}
      >
        {viewingOrder && (
          <div>
            <div className="mb-6">
              <Text type="secondary">Thông tin đơn hàng</Text>
              <div className="bg-gray-50 p-4 rounded-lg mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary">Mã đơn hàng:</Text>
                    <div className="font-medium">{viewingOrder.id}</div>
                  </div>
                  <div>
                    <Text type="secondary">Ngày đặt:</Text>
                    <div>{formatDate(viewingOrder.createdAt)}</div>
                  </div>
                  <div>
                    <Text type="secondary">Trạng thái:</Text>
                    <div>{getStatusTag(viewingOrder.status)}</div>
                  </div>
                  <div>
                    <Text type="secondary">Thanh toán:</Text>
                    <div>{getPaymentStatusTag(viewingOrder.paymentStatus)}</div>
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            <div className="mb-6">
              <Text type="secondary">Sản phẩm</Text>
              <div className="mt-2">
                {viewingOrder.items.length > 0 ? (
                  viewingOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start py-3 border-b"
                    >
                      <div className="w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.productVariant.cover}
                          alt={item.productVariant.name}
                          className="w-full h-full object-cover rounded"
                          preview={false}
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <div className="font-medium">
                          {item.productVariant.name}
                        </div>
                        <div className="text-gray-500 text-sm">
                          Size: {item.productVariant.size}, Màu:{" "}
                          {item.productVariant.colorName}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-gray-500">
                            {formatPrice(item.price)} x {item.quantity}
                          </div>
                          <div className="font-medium">
                            {formatPrice(item.total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <Empty description="Không có thông tin sản phẩm" />
                )}
              </div>
            </div>

            <Divider />

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <Text>Tạm tính:</Text>
                <Text>{formatPrice(viewingOrder.subTotal)}</Text>
              </div>
              {viewingOrder.discount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <Text className="text-green-600">Giảm giá:</Text>
                  <Text>- {formatPrice(viewingOrder.discount)}</Text>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <Text>Phí vận chuyển:</Text>
                <Text>
                  {formatPrice(
                    viewingOrder.total -
                      viewingOrder.subTotal +
                      viewingOrder.discount
                  )}
                </Text>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between">
                <Text strong className="text-lg">
                  Tổng cộng:
                </Text>
                <Text strong className="text-lg text-red-600">
                  {formatPrice(viewingOrder.total)}
                </Text>
              </div>
            </div>

            {viewingOrder.status === "completed" && (
              <div className="mt-6">
                <Button
                  type="primary"
                  block
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Mua lại
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Order;
