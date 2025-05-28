import React, { useState, useEffect, useContext } from "react";
import {
  Typography,
  Button,
  InputNumber,
  Divider,
  Input,
  Select,
  Radio,
  Space,
  Table,
  Image,
  Tag,
  notification,
  Empty,
} from "antd";
import {
  DeleteOutlined,
  ShoppingOutlined,
  RightOutlined,
  LeftOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  IssuesCloseOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { CartContext } from "../../context/CartContext";

const { Title, Text } = Typography;
const { Option } = Select;

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const shippingFee = 30000;

  // Fetch cart items (mocked)
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await apiClient.get("/api/carts/anonymous");
        setCartItems(response.data.data.items || []);
        console.log(response.data.data.items);
        setSelectedItems(response.data.data.items.map((item) => item.id));
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tải giỏ hàng. Vui lòng thử lại sau.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, []);

  const openErrorNotification = (message) => {
    api.open({
      message: <span className="text-red-500">Thông báo</span>,
      type: "error",
      description: <span className="font-semibold">{message}</span>,
      icon: <IssuesCloseOutlined style={{ color: "red" }} />,
      placement: "topRight",
      pauseOnHover: true,
      showProgress: true,
      duration: 3,
    });
  };

  // Mock vouchers
  const vouchers = [
    {
      code: "SUMMER25",
      discount: 0.25,
      type: "percentage",
      description: "Giảm 25% tổng đơn hàng",
    },
    {
      code: "FREESHIP",
      discount: 30000,
      type: "shipping",
      description: "Miễn phí vận chuyển",
    },
    {
      code: "SALE100K",
      discount: 100000,
      type: "fixed",
      description: "Giảm 100.000₫",
    },
  ];

  // Handle quantity change
  let timeoutId = null;
  const handleQuantityChange = (record, value) => {
    const cartItemId = record.id;
    const productVariantId = record.productVariantDTO.id;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      apiClient
        .put(`/api/carts/items/${cartItemId}`, {
          productVariantDTO: {
            id: productVariantId,
          },
          quantity: value,
        })
        .then((response) => {
          setCartItems((prev) =>
            prev.map((item) =>
              item.id === cartItemId ? { ...item, quantity: value } : item
            )
          );
        })
        .catch((error) => {
          console.error("Failed to update quantity:", error);
          openErrorNotification("Không thể cập nhật số lượng sản phẩm.");
        });
    }, 500);
  };

  // Handle item removal
  const handleRemoveItem = (id) => {
    apiClient
      .delete(`/api/carts/items/${id}`)
      .then((response) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
        notification.success({
          message: "Đã xóa sản phẩm",
          description: "Sản phẩm đã được xóa khỏi giỏ hàng.",
        });
      })
      .catch((error) => {
        console.error("Failed to remove item:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể xóa sản phẩm. Vui lòng thử lại sau.",
        });
      });
  };

  // Handle item selection
  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // Handle select all items
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Apply voucher
  const handleApplyVoucher = () => {
    const voucher = vouchers.find((v) => v.code === voucherCode);
    if (voucher) {
      setAppliedVoucher(voucher);
      notification.success({
        message: "Áp dụng mã giảm giá thành công",
        description: voucher.description,
      });
    } else {
      notification.error({
        message: "Mã không hợp lệ",
        description: "Mã giảm giá không tồn tại hoặc đã hết hạn.",
      });
    }
    setVoucherCode("");
  };

  // Remove voucher
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    notification.info({
      message: "Đã xóa mã giảm giá",
      description: "Mã giảm giá đã được xóa khỏi đơn hàng.",
    });
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      return;
    }
    const selectedCartItems = cartItems.filter((item) =>
      selectedItems.includes(item.id)
    );
    localStorage.removeItem("selected-cart-items");
    localStorage.setItem(
      "selected-cart-items",
      JSON.stringify(selectedCartItems)
    );
    localStorage.removeItem("applied-voucher");
    localStorage.setItem("applied-voucher", JSON.stringify(appliedVoucher));
    navigate("/checkout");
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce(
        (total, item) => total + item.productVariantDTO.price * item.quantity,
        0
      );
  };

  // Calculate discount amount
  const calculateDiscount = () => {
    if (!appliedVoucher) return 0;
    const subtotal = calculateSubtotal();

    if (appliedVoucher.type === "percentage") {
      return subtotal * appliedVoucher.discount;
    } else if (appliedVoucher.type === "fixed") {
      return appliedVoucher.discount;
    } else if (appliedVoucher.type === "shipping") {
      return shippingFee;
    }

    return 0;
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = appliedVoucher?.type === "shipping" ? 0 : shippingFee;
    return subtotal - discount + shipping;
  };

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Table columns
  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "product",
      key: "product",
      render: (_, record) => (
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            checked={selectedItems.includes(record.id)}
            onChange={(e) => handleSelectItem(record.id, e.target.checked)}
            className="w-4 h-4 accent-indigo-600"
          />
          <div className="w-20 h-20 flex-shrink-0">
            <Image
              src={record.productVariantDTO.cover}
              alt={record.productVariantDTO.name}
              className="w-full h-full object-cover rounded"
              preview={false}
            />
          </div>
          <div className="flex-grow">
            <Link
              to={`/products/${record.productVariantDTO.slug}`}
              className="text-lg font-medium hover:text-indigo-600 transition"
            >
              {record.productVariantDTO.name}
            </Link>
            <div className="flex flex-wrap gap-2 mt-1">
              <Tag color="default">Size: {record.productVariantDTO.size}</Tag>
              <Tag
                color="default"
                style={{
                  backgroundColor: record.productVariantDTO.colorHex,
                  color:
                    record.productVariantDTO.colorHex === "#FFFFFF" ||
                    record.productVariantDTO.colorHex === "#ffffff"
                      ? "#000"
                      : "#fff",
                }}
              >
                {record.productVariantDTO.colorName}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (_, record) => (
        <div>
          <div className="text-lg font-semibold">
            {formatPrice(record.productVariantDTO.price)}
          </div>
          {record.productVariantDTO.originalPrice >
            record.productVariantDTO.price && (
            <div className="text-sm line-through text-gray-500">
              {formatPrice(record.productVariantDTO.originalPrice)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (_, record) => (
        <InputNumber
          min={1}
          max={100}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record, value)}
          className="w-20"
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      align: "right",
      render: (_, record) => (
        <span className="text-lg font-semibold text-red-600">
          {formatPrice(record.productVariantDTO.price * record.quantity)}
        </span>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_, record) => (
        <Button
          icon={<DeleteOutlined />}
          type="text"
          danger
          onClick={() => handleRemoveItem(record.id)}
        />
      ),
    },
  ];

  // Select before for voucher input
  const selectBefore = (
    <Select defaultValue="voucher" className="w-28">
      <Option value="voucher">Voucher</Option>
    </Select>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-display">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Title level={2} className="font-bold flex items-center">
            <ShoppingCartOutlined className="mr-2" /> Giỏ hàng của bạn
          </Title>
          <Text className="text-gray-500">
            {cartItems.length} sản phẩm trong giỏ hàng
          </Text>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-8 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
              <Text className="text-gray-500">Đang tải giỏ hàng...</Text>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-xl p-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-500 text-lg">
                  Giỏ hàng của bạn đang trống
                </span>
              }
            >
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => navigate("/products")}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                Tiếp tục mua sắm
              </Button>
            </Empty>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 pb-0">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === cartItems.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 mr-2"
                    />
                    <Text strong>
                      Chọn tất cả ({cartItems.length} sản phẩm)
                    </Text>
                  </div>
                </div>

                <Table
                  columns={columns}
                  dataSource={cartItems}
                  rowKey="id"
                  pagination={false}
                  showHeader={false}
                  className="custom-cart-table"
                />

                <div className="p-6 flex justify-between items-center">
                  <Button
                    icon={<LeftOutlined />}
                    onClick={() => navigate("/products")}
                  >
                    Tiếp tục mua sắm
                  </Button>

                  <div className="text-right">
                    <Text className="text-gray-500">
                      Tổng tiền (
                      {cartItems
                        .filter((item) => selectedItems.includes(item.id))
                        .reduce((acc, item) => acc + item.quantity, 0)}{" "}
                      sản phẩm):
                    </Text>
                    <div className="text-2xl font-bold text-red-600 mt-1">
                      {formatPrice(calculateSubtotal())}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <Title level={4} className="mb-4">
                  Tóm tắt đơn hàng
                </Title>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <Text>Tạm tính:</Text>
                    <Text strong>{formatPrice(calculateSubtotal())}</Text>
                  </div>

                  <div className="flex justify-between">
                    <Text>Phí vận chuyển:</Text>
                    <Text>
                      {appliedVoucher?.type === "shipping"
                        ? "Miễn phí"
                        : formatPrice(shippingFee)}
                    </Text>
                  </div>

                  {appliedVoucher && (
                    <div className="flex justify-between text-green-600">
                      <div className="flex items-center">
                        <Text className="text-green-600">Giảm giá:</Text>
                        <Button
                          type="text"
                          size="small"
                          danger
                          className="ml-2 p-0 h-auto"
                          onClick={handleRemoveVoucher}
                        >
                          <DeleteOutlined />
                        </Button>
                      </div>
                      <Text strong className="text-green-600">
                        - {formatPrice(calculateDiscount())}
                      </Text>
                    </div>
                  )}
                </div>

                <Divider />

                <div className="flex justify-between mb-6">
                  <Text strong className="text-lg">
                    Tổng cộng:
                  </Text>
                  <Title level={3} className="m-0 text-red-600">
                    {formatPrice(calculateTotal())}
                  </Title>
                </div>

                {!appliedVoucher && (
                  <div className="mb-6">
                    <div className="flex mb-2">
                      <Input
                        addonBefore={selectBefore}
                        placeholder="Nhập mã giảm giá"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        suffix={
                          <Button
                            type="primary"
                            size="small"
                            onClick={handleApplyVoucher}
                            disabled={!voucherCode}
                            className="bg-indigo-600"
                          >
                            Áp dụng
                          </Button>
                        }
                      />
                    </div>

                    <div className="text-sm text-gray-500 flex items-center">
                      <TagOutlined className="mr-1" /> Các mã hiện có: SUMMER25,
                      FREESHIP, SALE100K
                    </div>
                  </div>
                )}

                <Button
                  color="purple"
                  size="large"
                  variant="solid"
                  block
                  onClick={handleCheckout}
                  className="h-12 flex items-center justify-center text-lg bg-indigo-600 hover:bg-indigo-700"
                  disabled={selectedItems.length === 0}
                >
                  Tiến hành thanh toán <RightOutlined className="ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
