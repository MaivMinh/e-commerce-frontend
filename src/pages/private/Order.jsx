import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Pagination,
  Spin,
  Empty,
  Typography,
  Modal,
  Divider,
  Image,
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
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
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
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const fetchOrders = async (
    page = currentPage,
    size = pageSize,
    keyword = null,
    status = null,
    sort = sortBy,
    direction = sortDirection
  ) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/api/orders/search", {
        page: page,
        size: size,
        keyword: keyword,
        status: status,
        sortBy: sort,
        sortDirection: direction,
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
  }, [sortBy, sortDirection]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail(orderId);
      return;
    }

    setDrawerVisible(false);
    setViewingOrder(null);
  }, [orderId, orders]);

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
      fetchOrders(page, pageSize, searchText.trim(), status, sortBy, sortDirection);
    } else {
      fetchOrders(page, pageSize, null, status, sortBy, sortDirection);
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.field) {
      const newSortBy = sorter.field;
      const newSortDirection = sorter.order === 'ascend' ? 'asc' : 'desc';
      
      setSortBy(newSortBy);
      setSortDirection(newSortDirection);
      
      const kw = searchText && searchText.trim() ? searchText.trim() : null;
      fetchOrders(currentPage, pageSize, kw, status, newSortBy, newSortDirection);
    } else {
      // Reset sorting
      setSortBy('');
      setSortDirection('desc');
      const kw = searchText && searchText.trim() ? searchText.trim() : null;
      fetchOrders(currentPage, pageSize, kw, status, '', 'desc');
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
    switch (status) {
      case "CREATED":
        return (
          <Tag color="default" icon={<ClockCircleOutlined />}>
            Đã tạo
          </Tag>
        );
      case "CONFIRMED":
        return (
          <Tag color="blue" icon={<CheckCircleOutlined />}>
            Đã xác nhận
          </Tag>
        );
      case "DELIVERED":
        return (
          <Tag color="cyan" icon={<InboxOutlined />}>
            Đã giao
          </Tag>
        );
      case "SUCCESS":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Thành công
          </Tag>
        );
      case "CANCELLED":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Đã hủy
          </Tag>
        );
      case "ROLLBACK":
        return (
          <Tag color="warning" icon={<SyncOutlined />}>
            Hoàn trả
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };
  const getPaymentStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <Tag color="warning" icon={<ClockCircleOutlined />}>
            Chờ thanh toán
          </Tag>
        );
      case "COMPLETED":
        return (
          <Tag color="success" icon={<DollarOutlined />}>
            Đã thanh toán
          </Tag>
        );
      case "FAILED":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Thất bại
          </Tag>
        );
      case "REFUNDED":
        return (
          <Tag color="purple" icon={<SyncOutlined />}>
            Đã hoàn tiền
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const viewOrderDetail = (order) => {
    setViewingOrder(order);
    setDrawerVisible(true);
    navigate(`/orders/${order.id}`);
  };

  const fetchOrderDetail = async (targetOrderId) => {
    if (!targetOrderId) {
      return;
    }

    const matchedOrder = orders.find((order) => order.id === targetOrderId);
    if (matchedOrder) {
      setViewingOrder(matchedOrder);
      setDrawerVisible(true);
      return;
    }

    setDetailLoading(true);
    try {
      const response = await apiClient.get(`/api/orders/${targetOrderId}`);
      const data = response.data.data || response.data;
      setViewingOrder(data);
      setDrawerVisible(true);
      setError(null);
      return;
    } catch (error) {
      try {
        const response = await apiClient.post("/api/orders/search", {
          page: 1,
          size: 10,
          keyword: targetOrderId,
          status: null,
          sortBy,
          sortDirection,
        });

        const data = response.data.data;
        const foundOrder = (data.orders || []).find(
          (order) => order.id === targetOrderId
        );

        if (foundOrder) {
          setViewingOrder(foundOrder);
          setDrawerVisible(true);
          setError(null);
          return;
        }

        setError("Không tìm thấy đơn hàng được yêu cầu");
        setViewingOrder(null);
        setDrawerVisible(false);
      } catch (innerError) {
        setError("Đã xảy ra lỗi khi tải chi tiết đơn hàng");
        setViewingOrder(null);
        setDrawerVisible(false);
      }
    } finally {
      setDetailLoading(false);
    }
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
      sorter: true,
      sortOrder: sortBy === 'createdAt' ? (sortDirection === 'asc' ? 'ascend' : 'descend') : null,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total) => (
        <span className="font-medium text-red-600">{formatPrice(total)}</span>
      ),
      sorter: true,
      sortOrder: sortBy === 'total' ? (sortDirection === 'asc' ? 'ascend' : 'descend') : null,
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
              fetchOrders(1, pageSize, kw, value || null, sortBy, sortDirection);
            }}
            options={[
              { label: "Tất cả", value: null },
              { label: "Thành công", value: "SUCCESS" },
              { label: "Thất bại", value: "CANCELLED" }
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
              fetchOrders(1, pageSize, kw, status, sortBy, sortDirection);
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
            onChange={handleTableChange}
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

      {/* Order Detail Modal */}
      <Modal
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
        centered
        onCancel={() => navigate("/orders")}
        open={drawerVisible}
        footer={null}
        width={760}
        destroyOnClose
      >
        {detailLoading ? (
          <div className="py-10 flex justify-center">
            <Spin />
          </div>
        ) : viewingOrder ? (
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
                          src={item.productVariant?.cover}
                          alt={item.productVariant?.name}
                          className="w-full h-full object-cover rounded"
                          preview={false}
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <button
                          type="button"
                          className="text-left font-medium text-gray-900 cursor-pointer rounded px-1 -mx-1 transition-all duration-200 hover:text-indigo-600 hover:bg-gray-100 hover:shadow-sm"
                          onClick={() => navigate(`/products/${item.productVariant?.slug}`)}
                        >
                          {item.productVariant?.name}
                        </button>
                        <div className="text-gray-500 text-sm">
                          Size: {item.productVariant?.size}, Màu:{" "}
                          {item.productVariant?.colorName}
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
        ) : (
          <Empty description="Không có thông tin đơn hàng" />
        )}
      </Modal>
    </div>
  );
};

export default Order;
