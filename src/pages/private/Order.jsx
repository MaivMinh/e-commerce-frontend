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

const Order = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const fetchOrders = async (page = currentPage, size = pageSize) => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/orders", {
        params: {
          page: page,
          size: size,
        },
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
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách đơn hàng");
      setOrders([]);
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

    // Filter orders based on search text
    const filtered = orders.filter((order) => {
      // Search in order ID
      if (order.id.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in product names (if order has items)
      if (order.orderItemDTOs && order.orderItemDTOs.length > 0) {
        return order.orderItemDTOs.some((item) =>
          item.productVariantDTO?.name?.toLowerCase().includes(searchLower)
        );
      }

      // Search in total amount (convert to string first)
      if (order.total.toString().includes(searchLower)) {
        return true;
      }

      // Search in status
      if (order.status.toLowerCase().includes(searchLower)) {
        return true;
      }

      return false;
    });

    setFilteredOrders(filtered);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    fetchOrders(page, pageSize);
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
      filters: [
        { text: "Hoàn thành", value: "completed" },
        { text: "Đang xử lý", value: "processing" },
        { text: "Đang giao", value: "shipped" },
        { text: "Chờ xử lý", value: "pending" },
        { text: "Thất bại", value: "failed" },
        { text: "Đã hủy", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
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
        <div className="max-w-full flex flex-row justify-end items-center mb-4">
          <Search
            placeholder="Tìm kiếm theo mã đơn hàng hoặc sản phẩm"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => {
              // Call handleSearch with the current input value on every change
              handleSearch(e.target.value);
            }}
            style={{
              width: "50%"
            }}
          />
        </div>

        <Card className="shadow-sm rounded-lg">
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            loading={loading}
            pagination={
              !searchText
                ? false
                : {
                    pageSize: 10,
                    hideOnSinglePage: true,
                  }
            }
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

          {!searchText && totalElements > 0 && (
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
                {viewingOrder.orderItemDTOs.length > 0 ? (
                  viewingOrder.orderItemDTOs.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start py-3 border-b"
                    >
                      <div className="w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.productVariantDTO.cover}
                          alt={item.productVariantDTO.name}
                          className="w-full h-full object-cover rounded"
                          preview={false}
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <div className="font-medium">
                          {item.productVariantDTO.name}
                        </div>
                        <div className="text-gray-500 text-sm">
                          Size: {item.productVariantDTO.size}, Màu:{" "}
                          {item.productVariantDTO.colorName}
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
