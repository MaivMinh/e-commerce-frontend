import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Form,
  Input,
  Radio,
  Space,
  Divider,
  Steps,
  Image,
  List,
  notification,
  Modal,
  Result,
  Spin,
  Checkbox,
} from "antd";
import {
  CreditCardOutlined,
  BankOutlined,
  WalletOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import apiClient from "../../services/apiClient";
import { keycloak } from "../../services/keycloak";

const { Title, Text, Paragraph } = Typography;

const Checkout = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState(
    "ORD" + Math.floor(100000 + Math.random() * 900000)
  );
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [stockErrorMessage, setStockErrorMessage] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [addresses, setAddresses] = useState([]);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm] = Form.useForm();
  const [addingAddress, setAddingAddress] = useState(false);
  
  const [productId, setProductId] = useState(null);

  // Mock shipping fee
  const shippingFee = 30000;


  const fetchProductDetail = async () => {
    const items = localStorage.getItem("selected-cart-items");
    if (items.length <= 0) return;
    try {

      const productVariant = JSON.parse(items)[0].productVariantDTO;
      const productVariantId = productVariant.id;
      
      const response = await apiClient.get(`/api/products/find-by-product-variant?productVariantId=${productVariantId}`);
        const product = response.data.data;
        setProductId(product);
    } catch (error) {
      console.error("Error fetching product by slug:", error);
    }
  }

  useEffect(() => {
    fetchProductDetail();
  }, [])
  
  
  // Load cart data
  useEffect(() => {
    setLoading(true);

    // Load selected cart items
    const loadCartItems = () => {
      const selectedCartItems = JSON.parse(
        localStorage.getItem("selected-cart-items") || "[]"
      );

      if (selectedCartItems.length === 0) {
        notification.warning({
          message: "Giỏ hàng trống",
          description:
            "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.",
        });
        navigate("/cart");
        return false;
      }

      setCartItems(selectedCartItems);
      return true;
    };

    // Load applied promotion
    const loadPromotion = () => {
      const promotion = JSON.parse(
        localStorage.getItem("applied-promotion") || "null"
      );
      setAppliedPromotion(promotion);
    };

    // Simulate loading data
    setTimeout(() => {
      // Only proceed if we have cart items
      if (loadCartItems()) {
        loadPromotion();
        loadPaymentMethods();

        // Only load addresses if authenticated
        if (keycloak.authenticated) {
          loadUserAddresses();
        }
      }

      setLoading(false);
    }, 1000);
  }, [navigate]);

  // Load payment methods
  const loadPaymentMethods = async () => {
    try {
      const response = await apiClient.post("/api/payment-methods/search", {});

      const methods = response.data.data.paymentMethods || [];

      setPaymentMethods(methods);

      // Set default payment method
      if (methods.length > 0) {
        setPaymentMethodId(methods[0].id);
      }
    } catch (error) {
      console.log("Error loading payment methods:", error);
    }
  };

  // Load user addresses
  const loadUserAddresses = async () => {
    try {
      // In a real app, this would be an API call
      const response = await apiClient.get("/api/addresses");
      const addresses = response.data.data || [];

      setAddresses(addresses);

      // Set default selected address
      const defaultAddress =
        addresses.find((addr) => addr.isDefault) || addresses[0];
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      }
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ:", error);

      // Use mock data if API fails
      const mockAddresses = [
        {
          id: 1,
          fullName: "Nguyễn Văn A",
          phone: "0901234567",
          address: "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh",
          isDefault: true,
        },
        {
          id: 2,
          fullName: "Nguyễn Văn A",
          phone: "0909876543",
          address: "456 Đường Nguyễn Huệ, Quận 3, TP. Hồ Chí Minh",
          isDefault: false,
        },
      ];

      setAddresses(mockAddresses);
      setSelectedAddress(mockAddresses[0].id);
    }
  };

  // Add new address
  const handleAddAddress = async (values) => {
    setAddingAddress(true);

    try {
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        isDefault: values.isDefault || false,
      };

      // In a real app, this would be an API call
      // Simulate API call with timeout
      setTimeout(() => {
        // Create a new address with a unique ID
        const newAddress = {
          ...payload,
          id: addresses.length + 1,
        };

        // Update addresses list
        const updatedAddresses = [...addresses];

        // If this is the default address, remove default from others
        if (newAddress.isDefault) {
          updatedAddresses.forEach((addr) => {
            addr.isDefault = false;
          });
        }

        updatedAddresses.push(newAddress);
        setAddresses(updatedAddresses);

        // Select the new address
        setSelectedAddress(newAddress.id);

        // Show success notification
        notification.success({
          message: "Thêm địa chỉ thành công",
          description:
            "Địa chỉ mới đã được thêm vào danh sách địa chỉ của bạn.",
        });

        // Close modal and reset form
        setShowAddressModal(false);
        addressForm.resetFields();
        setAddingAddress(false);
      }, 500);
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ:", error);
      notification.error({
        message: "Thêm địa chỉ thất bại",
        description: "Đã xảy ra lỗi khi thêm địa chỉ mới.",
      });
      setAddingAddress(false);
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.productVariantDTO.price * item.quantity,
      0
    );
  };

  // Calculate discount amount
  const calculateDiscount = () => {
    if (!appliedPromotion) return 0;
    const subtotal = calculateSubtotal();

    if (appliedPromotion.type === "percentage") {
      return (subtotal * appliedPromotion.discountValue) / 100;
    } else if (appliedPromotion.type === "fixed") {
      return appliedPromotion.discountValue;
    } else if (appliedPromotion.type === "shipping") {
      return shippingFee;
    }

    return 0;
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = appliedPromotion?.type === "shipping" ? 0 : shippingFee;

    return subtotal - discount + shipping;
  };

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Handle address selection
  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
  };

  // Form submission handler
  const handleSubmit = async (values) => {
    if (currentStep === 0) {
      // Validate shipping address
      if (!selectedAddress) {
        notification.error({
          message: "Vui lòng chọn địa chỉ giao hàng",
          description: "Bạn cần chọn địa chỉ giao hàng trước khi tiếp tục.",
        });
        return;
      }

      // Move to payment step
      setCurrentStep(1);
      window.scrollTo(0, 0);
    } else if (currentStep === 1) {
      // Validate payment method
      if (!paymentMethodId) {
        notification.error({
          message: "Vui lòng chọn phương thức thanh toán",
          description:
            "Bạn cần chọn phương thức thanh toán trước khi đặt hàng.",
        });
        return;
      }

      // Handle payment based on selected method
      if (isPaymentMethodType("e_wallet")) {
        setShowQRModal(true);
      } else {
        simulatePaymentProcessing();
      }
    }
  };

  // Get selected payment method
  const getSelectedPaymentMethod = () => {
    return paymentMethods.find((method) => method.id === paymentMethodId);
  };

  // Check payment method type
  const isPaymentMethodType = (type) => {
    const method = getSelectedPaymentMethod();
    return method && method.type === type;
  };

  // Hàm gọi API để đặt hàng
  const placeOrder = async () => {
    try {
      setPaymentProcessing(true);

      const selectedAddressInfo = getSelectedAddressInfo();
      if (!selectedAddressInfo) {
        notification.error({
          message: "Địa chỉ không hợp lệ",
          description: "Vui lòng chọn địa chỉ giao hàng hợp lệ.",
        });
        setPaymentProcessing(false);
        return;
      }

      // Chuẩn bị dữ liệu đơn hàng
      const orderPayload = {
        shippingAddressId: selectedAddressInfo.id,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        total: calculateTotal(),
        paymentMethodId: getSelectedPaymentMethod().id,
        promotionId: appliedPromotion?.id || null,
        currency: "VND",
        note: form.getFieldValue("note") || "",
        orderItemDtos: cartItems.map((item) => ({
          productVariantId: item.productVariantDTO.id,
          quantity: item.quantity,
          price: item.productVariantDTO.price,
          total: item.productVariantDTO.price * item.quantity,
        })),
        productId: productId
      };

      // Gọi API đặt hàng
      const response = await apiClient.post("/api/orders", orderPayload);

      // Xử lý kết quả
      // Cập nhật orderId từ response nếu có
      if (response.data.data?.orderId) {
        setOrderId(response.data.data.orderId);
      } else {
        setOrderId("ORD" + Math.floor(100000 + Math.random() * 900000));
      }

      setShowQRModal(false);
      setShowSuccessModal(true);
      setShowFailureModal(false);

      notification.success({
        message: "Đặt hàng thành công",
        description: `Cảm ơn bạn đã mua sắm tại Shop! Vui lòng kiểm tra email để biết thêm chi tiết.`,
      });

      return true;
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);

      setShowSuccessModal(false);

      // Xử lý lỗi cụ thể
      if (
        error.response?.data?.message?.includes("không đủ số lượng trong kho")
      ) {
        setStockErrorMessage(
          "Sản phẩm trong giỏ hàng của bạn hiện không đủ số lượng trong kho."
        );
      } else {
        setStockErrorMessage(
          error.response?.data?.message || "Có lỗi xảy ra khi xử lý đơn hàng."
        );
      }

      setShowFailureModal(true);
      return false;
    } finally {
      setPaymentProcessing(false);
    }
  };

  const simulatePaymentProcessing = async () => {
    // Reset modals
    setShowSuccessModal(false);
    setShowFailureModal(false);
    setStockErrorMessage("");
    setPaymentProcessing(true);

    // Gọi API để đặt hàng
    await placeOrder();
  };

  // Get selected address info
  const getSelectedAddressInfo = () => {
    if (!selectedAddress || addresses.length === 0) return null;
    const address = addresses.find((addr) => addr.id === selectedAddress);
    return address || null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-display">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Title level={2} className="font-bold flex items-center">
            Thanh toán
          </Title>

          <Steps
            current={currentStep}
            items={[
              { title: "Thông tin giao hàng", icon: <EnvironmentOutlined /> },
              { title: "Thanh toán", icon: <CreditCardOutlined /> },
              { title: "Hoàn tất", icon: <CheckCircleOutlined /> },
            ]}
            className="mt-6"
          />
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-8 flex justify-center">
            <div className="flex flex-col items-center">
              <Spin size="large" />
              <Text className="text-gray-500 mt-4">Đang tải thông tin...</Text>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                {currentStep === 0 && (
                  <div className="p-6">
                    <Title level={4} className="mb-4 flex items-center">
                      <EnvironmentOutlined className="mr-2" /> Địa chỉ giao hàng
                    </Title>

                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleSubmit}
                      initialValues={{
                        address_id: selectedAddress,
                      }}
                    >
                      <div className="mb-6">
                        <Text strong className="mb-2 block">
                          Chọn địa chỉ đã lưu:
                        </Text>
                        <Form.Item name="address_id">
                          <Radio.Group
                            onChange={(e) =>
                              handleAddressSelect(e.target.value)
                            }
                            value={selectedAddress}
                          >
                            <Space
                              direction="vertical"
                              className="w-full"
                              size={16}
                            >
                              {addresses.map((address) => (
                                <Radio.Button
                                  key={address.id}
                                  value={address.id}
                                  className="w-full h-auto p-4 text-left flex"
                                >
                                  <div className="w-full">
                                    <div className="flex justify-between">
                                      <div className="font-medium">
                                        {address.fullName}
                                      </div>
                                      {address.isDefault && (
                                        <p className="font-semibold text-indigo-600">
                                          Mặc định
                                        </p>
                                      )}
                                      <div className="text-gray-500">
                                        {address.phone}
                                      </div>
                                    </div>
                                    <div className="text-gray-600 mt-1">
                                      {address.address}
                                    </div>
                                  </div>
                                </Radio.Button>
                              ))}
                            </Space>
                          </Radio.Group>
                        </Form.Item>

                        <div className="text-right mt-4">
                          <Button
                            type="link"
                            className="text-indigo-600"
                            onClick={() => setShowAddressModal(true)}
                          >
                            + Thêm địa chỉ mới
                          </Button>
                        </div>
                      </div>

                      <div className="mb-6">
                        <Title level={4} className="mb-4 flex items-center">
                          <InfoCircleOutlined className="mr-2" /> Ghi chú đơn
                          hàng
                        </Title>
                        <Form.Item name="note">
                          <Input.TextArea
                            placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                            rows={4}
                          />
                        </Form.Item>
                      </div>

                      <Form.Item className="mb-0">
                        <div className="flex justify-between">
                          <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/cart")}
                          >
                            Quay lại giỏ hàng
                          </Button>
                          <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            Tiếp tục
                          </Button>
                        </div>
                      </Form.Item>
                    </Form>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="p-6">
                    <Title level={4} className="mb-4 flex items-center">
                      <CreditCardOutlined className="mr-2" /> Phương thức thanh
                      toán
                    </Title>

                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                      <Form.Item name="payment_method" className="mb-6">
                        <Radio.Group
                          onChange={(e) => setPaymentMethodId(e.target.value)}
                          value={paymentMethodId}
                          className="w-full space-y-4"
                        >
                          {paymentMethods.map((method) => (
                            <Radio.Button
                              key={method.paymentMethodId}
                              value={method.id}
                              className="flex items-center h-auto p-4 w-full text-left mb-2"
                              style={{
                                borderRadius: "8px",
                                height: "auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                marginBottom: "16px",
                              }}
                            >
                              <div className="flex items-center">
                                {method.iconUrl ? (
                                  <img
                                    src={method.iconUrl}
                                    alt={method.name}
                                    className="w-6 h-6 mr-2"
                                  />
                                ) : (
                                  <>
                                    {method.type === "credit_card" && (
                                      <CreditCardOutlined className="text-xl mr-2" />
                                    )}
                                    {method.type === "bank_transfer" && (
                                      <BankOutlined className="text-xl mr-2" />
                                    )}
                                    {method.type === "e_wallet" && (
                                      <WalletOutlined className="text-xl mr-2" />
                                    )}
                                    {method.type === "cod" && (
                                      <DollarOutlined className="text-xl mr-2" />
                                    )}
                                  </>
                                )}
                                {method.name}
                              </div>
                            </Radio.Button>
                          ))}
                        </Radio.Group>
                      </Form.Item>

                      {isPaymentMethodType("e_wallet") && (
                        <div className="ml-8 mb-6 p-4 bg-gray-50 rounded-lg">
                          <Paragraph className="text-gray-500 text-sm">
                            <InfoCircleOutlined className="mr-1" /> Bạn sẽ quét
                            mã QR để thanh toán qua{" "}
                            {getSelectedPaymentMethod()?.provider || ""} sau khi
                            xác nhận đơn hàng.
                          </Paragraph>
                        </div>
                      )}

                      {isPaymentMethodType("credit_card") && (
                        <div className="ml-8 mb-6 p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-4">
                            <Form.Item
                              label="Số thẻ"
                              name="card_number"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập số thẻ!",
                                },
                              ]}
                            >
                              <Input
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                              />
                            </Form.Item>

                            <div className="grid grid-cols-2 gap-4">
                              <Form.Item
                                label="Ngày hết hạn"
                                name="expiry_date"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập ngày hết hạn!",
                                  },
                                ]}
                              >
                                <Input placeholder="MM/YY" maxLength={5} />
                              </Form.Item>

                              <Form.Item
                                label="CVV/CVC"
                                name="cvv"
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập mã CVV/CVC!",
                                  },
                                ]}
                              >
                                <Input placeholder="123" maxLength={3} />
                              </Form.Item>
                            </div>

                            <Form.Item
                              label="Tên chủ thẻ"
                              name="card_holder"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập tên chủ thẻ!",
                                },
                              ]}
                            >
                              <Input placeholder="NGUYEN VAN A" />
                            </Form.Item>
                          </div>

                          <div className="flex items-center text-gray-500 text-sm mt-4">
                            <LockOutlined className="mr-2" />
                            <span>
                              Thông tin thanh toán của bạn được bảo mật.
                            </span>
                          </div>
                        </div>
                      )}

                      {isPaymentMethodType("bank_transfer") && (
                        <div className="ml-8 mb-6 p-4 bg-gray-50 rounded-lg">
                          <Title level={5}>Thông tin chuyển khoản</Title>
                          <ul className="list-disc ml-5 text-gray-600">
                            <li>Ngân hàng: Vietcombank</li>
                            <li>Số tài khoản: 1234567890</li>
                            <li>Chủ tài khoản: CÔNG TY TNHH E-COMMERCE</li>
                          </ul>
                          <div className="mt-4 text-gray-500 text-sm">
                            <InfoCircleOutlined className="mr-1" /> Đơn hàng sẽ
                            được xử lý sau khi chúng tôi nhận được thanh toán
                            của bạn.
                          </div>
                        </div>
                      )}

                      <Form.Item className="mb-0">
                        <div className="flex justify-between">
                          <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => setCurrentStep(0)}
                          >
                            Quay lại
                          </Button>
                          <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="bg-indigo-600 hover:bg-indigo-700"
                            loading={paymentProcessing}
                          >
                            Đặt hàng
                          </Button>
                        </div>
                      </Form.Item>
                    </Form>
                  </div>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <Title level={4} className="mb-4">
                  Tóm tắt đơn hàng
                </Title>
                <List
                  itemLayout="horizontal"
                  dataSource={cartItems}
                  renderItem={(item) => (
                    <List.Item className="py-3">
                      <List.Item.Meta
                        avatar={
                          <div className="w-16 h-16">
                            <Image
                              src={item.productVariantDTO.cover}
                              alt={item.productVariantDTO.name}
                              className="w-full h-full object-cover rounded"
                              preview={false}
                            />
                          </div>
                        }
                        title={
                          <div className="text-gray-800 font-medium">
                            {item.productVariantDTO.name}{" "}
                            <span className="text-gray-500">
                              x{item.quantity}
                            </span>
                          </div>
                        }
                        description={
                          <div className="text-gray-500 text-sm">
                            Size: {item.productVariantDTO.size}, Màu:{" "}
                            {item.productVariantDTO.colorName}
                          </div>
                        }
                      />
                      <div className="text-right">
                        <div className="font-medium">
                          {formatPrice(
                            item.productVariantDTO.price * item.quantity
                          )}
                        </div>
                        {item.productVariantDTO.originalPrice >
                          item.productVariantDTO.price && (
                          <div className="text-xs line-through text-gray-500">
                            {formatPrice(
                              item.productVariantDTO.originalPrice *
                                item.quantity
                            )}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />

                <Divider />

                {selectedAddress && getSelectedAddressInfo() && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <Text strong>Giao tới:</Text>
                      <Button
                        type="link"
                        size="small"
                        className="p-0 text-indigo-600"
                        onClick={() => setCurrentStep(0)}
                      >
                        Thay đổi
                      </Button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium">
                        {getSelectedAddressInfo().fullName} |{" "}
                        {getSelectedAddressInfo().phone}
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {getSelectedAddressInfo().address}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <Text>Tạm tính:</Text>
                    <Text>{formatPrice(calculateSubtotal())}</Text>
                  </div>

                  <div className="flex justify-between">
                    <Text>Phí vận chuyển:</Text>
                    <Text>
                      {appliedPromotion?.type === "shipping"
                        ? "Miễn phí"
                        : formatPrice(shippingFee)}
                    </Text>
                  </div>

                  {appliedPromotion && (
                    <div className="flex justify-between text-green-600">
                      <Text className="text-green-600">Giảm giá:</Text>
                      <Text strong className="text-green-600">
                        - {formatPrice(calculateDiscount())}
                      </Text>
                    </div>
                  )}
                </div>

                <Divider />

                <div className="flex justify-between mb-2">
                  <Text strong className="text-lg">
                    Tổng cộng:
                  </Text>
                  <Title level={3} className="m-0 text-red-600">
                    {formatPrice(calculateTotal())}
                  </Title>
                </div>

                <div className="text-gray-500 text-sm text-right">
                  (Đã bao gồm VAT nếu có)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Payment Modal */}
      <Modal
        title={`Thanh toán qua ${
          getSelectedPaymentMethod()?.provider || "Ví điện tử"
        }`}
        open={showQRModal}
        onCancel={() => setShowQRModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowQRModal(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={paymentProcessing}
            onClick={simulatePaymentProcessing}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Đã thanh toán
          </Button>,
        ]}
        centered
      >
        <div className="text-center py-6">
          <div className="mb-4">
            <QRCodeSVG
              value={`https://payment.example.com/${
                getSelectedPaymentMethod()?.provider?.toLowerCase() || "wallet"
              }/checkout?amount=${calculateTotal()}&orderId=${orderId}`}
              size={200}
              level="H"
              className="mx-auto"
              imageSettings={{
                src: getSelectedPaymentMethod()?.iconUrl || "",
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          <Title level={4} className="mb-2">
            Quét mã để thanh toán
          </Title>
          <div className="text-lg font-semibold text-red-600">
            {formatPrice(calculateTotal())}
          </div>
          <Paragraph className="text-gray-500 mt-4">
            Mở ứng dụng {getSelectedPaymentMethod()?.provider || ""} trên điện
            thoại của bạn và quét mã QR này để thanh toán.
          </Paragraph>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        footer={null}
        closable={false}
        centered
        width={600}
        className="success-modal"
      >
        <Result
          status="success"
          title="Đặt hàng thành công!"
          subTitle={`Mã đơn hàng: ${orderId}. Cảm ơn bạn đã mua sắm tại Shop!`}
          extra={[
            <Button
              type="primary"
              key="console"
              onClick={() => navigate("/orders")}
              className="bg-indigo-600 hover:bg-indigo-700"
              size="large"
            >
              Xem đơn hàng
            </Button>,
            <Button key="buy" onClick={() => navigate("/")} size="large">
              Tiếp tục mua sắm
            </Button>,
          ]}
        />
      </Modal>

      {/* Failure Modal */}
      <Modal
        open={showFailureModal}
        footer={null}
        closable={false}
        centered
        width={600}
        className="failure-modal"
      >
        <Result
          status="error"
          title="Đặt hàng thất bại"
          subTitle={
            stockErrorMessage ||
            "Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau."
          }
          extra={[
            <Button
              type="primary"
              key="retry"
              onClick={() => {
                setShowFailureModal(false);
                setStockErrorMessage("");
              }}
              className="bg-red-600 hover:bg-red-700"
              size="large"
            >
              Thử lại
            </Button>,
            <Button
              key="cart"
              onClick={() => {
                navigate("/cart");
                setShowFailureModal(false);
                setStockErrorMessage("");
              }}
              size="large"
            >
              Quay lại giỏ hàng
            </Button>,
          ]}
        />
      </Modal>

      {/* Add Address Modal */}
      <Modal
        title="Thêm địa chỉ mới"
        open={showAddressModal}
        onCancel={() => setShowAddressModal(false)}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={handleAddAddress}
          initialValues={{ isDefault: false }}
        >
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input placeholder="Nhập họ tên người nhận" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input.TextArea
              placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
              rows={3}
            />
          </Form.Item>

          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end">
              <Button
                onClick={() => setShowAddressModal(false)}
                className="mr-2"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={addingAddress}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Thêm địa chỉ
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Checkout;
