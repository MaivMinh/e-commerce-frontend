import React, { useState, useEffect } from 'react';
import { 
  Typography, Button, Form, Input, Select, Radio, Space, Divider, 
  Steps, Image, List, Tag, notification, Modal, Result, Spin
} from 'antd';
import { 
  CreditCardOutlined, BankOutlined, WalletOutlined, DollarOutlined,
  EnvironmentOutlined, UserOutlined, PhoneOutlined, CheckCircleOutlined,
  ArrowLeftOutlined, LockOutlined, InfoCircleOutlined, CheckOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {QRCodeSVG} from 'qrcode.react';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('e_wallet');
  const [selectedWallet, setSelectedWallet] = useState('momo');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  
  // Mock shipping fee
  const shippingFee = 30000;

  // Load cart data
  useEffect(() => {
    // In a real app, you would fetch the cart and user's addresses from API
    setTimeout(() => {
      // Mock cart items
      setCartItems([
        {
          id: "17c43880-0d6d-45cb-afd4-0d16915f73b2",
          name: "Áo Thun Nam Cao Cấp",
          size: "L",
          color: { name: "Đen", hex: "#212121" },
          price: 350000,
          originalPrice: 450000,
          image: "https://res.cloudinary.com/deozipakf/image/upload/v1747929477/q9cwofgufdouofmhtey9.jpg",
          quantity: 2
        },
        {
          id: "28d54991-1e7e-56dc-bfe5-1e27026f84c3",
          name: "Quần Jeans Nữ Skinny",
          size: "M",
          color: { name: "Xanh dương", hex: "#1E88E5" },
          price: 520000,
          originalPrice: 520000,
          image: "https://res.cloudinary.com/deozipakf/image/upload/v1747929477/q9cwofgufdouofmhtey9.jpg",
          quantity: 1
        },
        {
          id: "39e65aa2-2f8f-67ed-cf06-2f38137f95d4",
          name: "Áo Khoác Nữ Dáng Dài",
          size: "S",
          color: { name: "Đỏ", hex: "#E53935" },
          price: 750000,
          originalPrice: 899000,
          image: "https://res.cloudinary.com/deozipakf/image/upload/v1747929477/q9cwofgufdouofmhtey9.jpg",
          quantity: 1
        }
      ]);
      
      // Mock addresses
      setAddresses([
        {
          id: 1,
          fullName: "Nguyễn Văn A",
          phone: "0987654321",
          address: "123 Đường Lê Lợi",
          ward: "Phường Bến Nghé",
          district: "Quận 1",
          city: "TP. Hồ Chí Minh",
          isDefault: true
        },
        {
          id: 2,
          fullName: "Nguyễn Văn A",
          phone: "0987654321",
          address: "456 Đường Nguyễn Huệ",
          ward: "Phường Bến Thành",
          district: "Quận 1",
          city: "TP. Hồ Chí Minh",
          isDefault: false
        }
      ]);
      
      // Set default address
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      } else if (addresses.length > 0) {
        setSelectedAddress(addresses[0].id);
      }
      
      // Set mock voucher (from Cart)
      setAppliedVoucher({
        code: "SUMMER25", 
        discount: 0.25, 
        type: "percentage", 
        description: "Giảm 25% tổng đơn hàng"
      });
      
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate discount amount
  const calculateDiscount = () => {
    if (!appliedVoucher) return 0;
    
    const subtotal = calculateSubtotal();
    
    if (appliedVoucher.type === 'percentage') {
      return subtotal * appliedVoucher.discount;
    } else if (appliedVoucher.type === 'fixed') {
      return appliedVoucher.discount;
    } else if (appliedVoucher.type === 'shipping') {
      return shippingFee;
    }
    
    return 0;
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = appliedVoucher?.type === 'shipping' ? 0 : shippingFee;
    
    return subtotal - discount + shipping;
  };

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Handle address selection
  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    if (currentStep === 0) {
      // Move to payment step
      setCurrentStep(1);
      window.scrollTo(0, 0);
    } else if (currentStep === 1) {
      // Submit payment
      if (paymentMethod === 'e_wallet') {
        setShowQRModal(true);
      } else {
        processPayment();
      }
    }
  };

  // Simulate payment processing
  const processPayment = () => {
    setPaymentProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setPaymentProcessing(false);
      setShowQRModal(false);
      setOrderPlaced(true);
      setShowSuccessModal(true);
    }, 2000);
  };

  // Handle wallet selection
  const handleWalletChange = (value) => {
    setSelectedWallet(value);
  };

  // Get selected address
  const getSelectedAddressInfo = () => {
    const address = addresses.find(addr => addr.id === selectedAddress);
    if (!address) return null;
    
    return {
      fullAddress: `${address.address}, ${address.ward}, ${address.district}, ${address.city}`,
      fullName: address.fullName,
      phone: address.phone
    };
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
              { title: 'Thông tin giao hàng', icon: <EnvironmentOutlined /> },
              { title: 'Thanh toán', icon: <CreditCardOutlined /> },
              { title: 'Hoàn tất', icon: <CheckCircleOutlined /> }
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
                        address_id: selectedAddress
                      }}
                    >
                      <div className="mb-6">
                        <Text strong className="mb-2 block">Chọn địa chỉ đã lưu:</Text>
                        <Form.Item name="address_id">
                          <Radio.Group onChange={(e) => handleAddressSelect(e.target.value)}>
                            <Space direction="vertical" className="w-full">
                              {addresses.map(address => (
                                <Radio.Button
                                  key={address.id}
                                  value={address.id}
                                  className="w-full h-auto p-4 text-left flex"
                                >
                                  <div>
                                    <div className="flex justify-between">
                                      <div className="font-medium">{address.fullName}</div>
                                      <div className="text-gray-500">{address.phone}</div>
                                    </div>
                                    <div className="text-gray-600 mt-1">
                                      {address.address}, {address.ward}, {address.district}, {address.city}
                                    </div>
                                    {address.isDefault && (
                                      <Tag color="blue" className="mt-2">Mặc định</Tag>
                                    )}
                                  </div>
                                </Radio.Button>
                              ))}
                            </Space>
                          </Radio.Group>
                        </Form.Item>
                        
                        <div className="text-right mt-4">
                          <Button type="link" className="text-indigo-600">
                            + Thêm địa chỉ mới
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <Title level={4} className="mb-4 flex items-center">
                          <InfoCircleOutlined className="mr-2" /> Ghi chú đơn hàng
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
                            onClick={() => navigate('/cart')}
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
                      <CreditCardOutlined className="mr-2" /> Phương thức thanh toán
                    </Title>
                    
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleSubmit}
                      initialValues={{
                        payment_method: paymentMethod,
                        wallet: selectedWallet
                      }}
                    >
                      <Form.Item name="payment_method" className="mb-6">
                        <Radio.Group 
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full space-y-2"
                        >
                          <Radio.Button 
                            value="credit_card" 
                            className="flex items-center h-auto p-4 w-full text-left mb-2"
                          >
                            <CreditCardOutlined className="text-xl mr-2" /> Thẻ tín dụng / ghi nợ
                          </Radio.Button>
                          <Radio.Button 
                            value="bank_transfer" 
                            className="flex items-center h-auto p-4 w-full text-left mb-2"
                          >
                            <BankOutlined className="text-xl mr-2" /> Chuyển khoản ngân hàng
                          </Radio.Button>
                          <Radio.Button 
                            value="e_wallet" 
                            className="flex items-center h-auto p-4 w-full text-left mb-2"
                          >
                            <WalletOutlined className="text-xl mr-2" /> Ví điện tử
                          </Radio.Button>
                          <Radio.Button 
                            value="cod" 
                            className="flex items-center h-auto p-4 w-full text-left mb-2"
                          >
                            <DollarOutlined className="text-xl mr-2" /> Thanh toán khi nhận hàng (COD)
                          </Radio.Button>
                        </Radio.Group>
                      </Form.Item>
                      
                      {paymentMethod === 'e_wallet' && (
                        <div className="ml-8 mb-6 p-4 bg-gray-50 rounded-lg">
                          <Form.Item name="wallet" label="Chọn ví điện tử">
                            <Radio.Group 
                              onChange={(e) => handleWalletChange(e.target.value)}
                              className="space-x-4"
                            >
                              <Radio.Button value="momo" className="p-2 h-16 w-20 flex justify-center items-center">
                                <div className="flex flex-col items-center">
                                  <img 
                                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-MoMo-Circle.png" 
                                    alt="MoMo" 
                                    className="w-8 h-8"
                                  />
                                  <span className="text-xs mt-1">MoMo</span>
                                </div>
                              </Radio.Button>
                              <Radio.Button value="zalopay" className="p-2 h-16 w-20 flex justify-center items-center">
                                <div className="flex flex-col items-center">
                                  <img 
                                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" 
                                    alt="ZaloPay" 
                                    className="w-8 h-8"
                                  />
                                  <span className="text-xs mt-1">ZaloPay</span>
                                </div>
                              </Radio.Button>
                              <Radio.Button value="vnpay" className="p-2 h-16 w-20 flex justify-center items-center">
                                <div className="flex flex-col items-center">
                                  <img 
                                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png" 
                                    alt="VNPay" 
                                    className="w-8 h-8"
                                  />
                                  <span className="text-xs mt-1">VNPay</span>
                                </div>
                              </Radio.Button>
                            </Radio.Group>
                          </Form.Item>
                          
                          <Paragraph className="text-gray-500 text-sm">
                            <InfoCircleOutlined className="mr-1" /> Bạn sẽ quét mã QR để thanh toán sau khi xác nhận đơn hàng.
                          </Paragraph>
                        </div>
                      )}
                      
                      {paymentMethod === 'credit_card' && (
                        <div className="ml-8 mb-6 p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-4">
                            <Form.Item 
                              label="Số thẻ" 
                              name="card_number"
                              rules={[{ required: true, message: 'Vui lòng nhập số thẻ!' }]}
                            >
                              <Input placeholder="1234 5678 9012 3456" maxLength={19} />
                            </Form.Item>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <Form.Item 
                                label="Ngày hết hạn" 
                                name="expiry_date"
                                rules={[{ required: true, message: 'Vui lòng nhập ngày hết hạn!' }]}
                              >
                                <Input placeholder="MM/YY" maxLength={5} />
                              </Form.Item>
                              
                              <Form.Item 
                                label="CVV/CVC" 
                                name="cvv"
                                rules={[{ required: true, message: 'Vui lòng nhập mã CVV/CVC!' }]}
                              >
                                <Input placeholder="123" maxLength={3} />
                              </Form.Item>
                            </div>
                            
                            <Form.Item 
                              label="Tên chủ thẻ" 
                              name="card_holder"
                              rules={[{ required: true, message: 'Vui lòng nhập tên chủ thẻ!' }]}
                            >
                              <Input placeholder="NGUYEN VAN A" />
                            </Form.Item>
                          </div>
                          
                          <div className="flex items-center text-gray-500 text-sm mt-4">
                            <LockOutlined className="mr-2" />
                            <span>Thông tin thanh toán của bạn được bảo mật.</span>
                          </div>
                        </div>
                      )}
                      
                      {paymentMethod === 'bank_transfer' && (
                        <div className="ml-8 mb-6 p-4 bg-gray-50 rounded-lg">
                          <Title level={5}>Thông tin chuyển khoản</Title>
                          <ul className="list-disc ml-5 text-gray-600">
                            <li>Ngân hàng: Vietcombank</li>
                            <li>Số tài khoản: 1234567890</li>
                            <li>Chủ tài khoản: CÔNG TY TNHH E-COMMERCE</li>
                            <li>Nội dung: [Mã đơn hàng] - [Tên của bạn]</li>
                          </ul>
                          <div className="mt-4 text-gray-500 text-sm">
                            <InfoCircleOutlined className="mr-1" /> Đơn hàng sẽ được xử lý sau khi chúng tôi nhận được thanh toán của bạn.
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
                            {paymentMethod === 'cod' ? 'Đặt hàng' : 'Thanh toán'}
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
                <Title level={4} className="mb-4">Tóm tắt đơn hàng</Title>
                
                <List
                  itemLayout="horizontal"
                  dataSource={cartItems}
                  renderItem={item => (
                    <List.Item className="py-3">
                      <List.Item.Meta
                        avatar={
                          <div className="w-16 h-16">
                            <Image
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded"
                              preview={false}
                            />
                          </div>
                        }
                        title={
                          <div className="text-gray-800 font-medium">
                            {item.name} <span className="text-gray-500">x{item.quantity}</span>
                          </div>
                        }
                        description={
                          <div className="text-gray-500 text-sm">
                            Size: {item.size}, Màu: {item.color.name}
                          </div>
                        }
                      />
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                        {item.originalPrice > item.price && (
                          <div className="text-xs line-through text-gray-500">
                            {formatPrice(item.originalPrice * item.quantity)}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
                
                <Divider />
                
                {selectedAddress && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <Text strong>Giao tới:</Text>
                      <Button type="link" size="small" className="p-0 text-indigo-600" onClick={() => setCurrentStep(0)}>
                        Thay đổi
                      </Button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      {getSelectedAddressInfo() && (
                        <>
                          <div className="font-medium">{getSelectedAddressInfo().fullName} | {getSelectedAddressInfo().phone}</div>
                          <div className="text-gray-600 text-sm mt-1">{getSelectedAddressInfo().fullAddress}</div>
                        </>
                      )}
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
                    <Text>{appliedVoucher?.type === 'shipping' ? 'Miễn phí' : formatPrice(shippingFee)}</Text>
                  </div>
                  
                  {appliedVoucher && (
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
                  <Text strong className="text-lg">Tổng cộng:</Text>
                  <Title level={3} className="m-0 text-red-600">{formatPrice(calculateTotal())}</Title>
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
        title={`Thanh toán qua ${selectedWallet === 'momo' ? 'MoMo' : selectedWallet === 'zalopay' ? 'ZaloPay' : 'VNPay'}`}
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
            onClick={processPayment}
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
              value={`https://payment.example.com/${selectedWallet}/checkout?amount=${calculateTotal()}&orderId=ORDER123456`} 
              size={200}
              level="H"
              className="mx-auto"
              imageSettings={{
                src: selectedWallet === 'momo' 
                  ? "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-MoMo-Circle.png"
                  : selectedWallet === 'zalopay'
                  ? "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png"
                  : "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png",
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          <Title level={4} className="mb-2">Quét mã để thanh toán</Title>
          <div className="text-lg font-semibold text-red-600">{formatPrice(calculateTotal())}</div>
          <Paragraph className="text-gray-500 mt-4">
            Mở ứng dụng {selectedWallet === 'momo' ? 'MoMo' : selectedWallet === 'zalopay' ? 'ZaloPay' : 'VNPay'} trên điện thoại của bạn và quét mã QR này để thanh toán.
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
          subTitle={`Mã đơn hàng: ORDER123456. Cảm ơn bạn đã mua sắm tại Shop!`}
          extra={[
            <Button 
              type="primary" 
              key="console" 
              onClick={() => navigate('/orders')}
              className="bg-indigo-600 hover:bg-indigo-700"
              size="large"
            >
              Xem đơn hàng
            </Button>,
            <Button key="buy" onClick={() => navigate('/')} size="large">Tiếp tục mua sắm</Button>,
          ]}
        />
      </Modal>
    </div>
  );
};

export default Checkout;