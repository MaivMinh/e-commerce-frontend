import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Avatar, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  List, 
  Tag, 
  Divider, 
  Modal, 
  Radio, 
  message, 
  Popconfirm, 
  Spin
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  LockOutlined, 
  EnvironmentOutlined, 
  PlusOutlined,
  CheckCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import moment from 'moment';
import apiClient from '../../services/apiClient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // Mô phỏng việc gọi API - trong thực tế sẽ thay bằng API call thực
      // const response = await apiClient.get('/api/users/profile');
      // const data = response.data;
      
      // Sử dụng dữ liệu mẫu cho demo
      const data = {
        "id": "da2f21bc-fec0-443b-81e9-511beb1bebd3",
        "username": "maivanminh",
        "email": "maivanminh.se@gmail.com",
        "fullName": "Mai Văn Minh",
        "avatar": null,
        "gender": "other",
        "birthDate": null,
        "addressDTOs": [
          {
            "id": "065fe3f5-850b-4f4a-91dd-184a5813afed",
            "fullName": "Mai Văn Minh",
            "phone": "0345730705",
            "address": "Chung cư Imperia An Phú, Quận 2, TP. Thủ Đức, TP. Hồ Chí Minh",
            "ward": null,
            "district": null,
            "city": null,
            "isDefault": false
          },
          {
            "id": "6e151352-c959-4d8e-aaba-490ba196c66a",
            "fullName": "Mai Văn Minh",
            "phone": "0345730705",
            "address": "Thôn 1, Quảng Hùng, Sầm Sơn, Thanh Hóa",
            "ward": null,
            "district": null,
            "city": null,
            "isDefault": true
          }
        ],
        "createdAt": "2025-06-08T12:47:58.000+00:00"
      };
      
      setUserProfile(data);
      
      // Set form initial values
      profileForm.setFieldsValue({
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        gender: data.gender,
        birthDate: data.birthDate ? dayjs(data.birthDate) : null
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      message.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (values) => {
    setSavingProfile(true);
    try {
      // Mô phỏng API call
      // await apiClient.put('/api/users/profile', {
      //   ...values,
      //   birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null
      // });
      
      // Cập nhật state local
      setUserProfile({
        ...userProfile,
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null
      });
      
      message.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Cập nhật thông tin thất bại');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setSavingPassword(true);
    try {
      // Mô phỏng API call
      // await apiClient.post('/api/users/change-password', values);
      
      message.success('Đổi mật khẩu thành công');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Đổi mật khẩu thất bại');
    } finally {
      setSavingPassword(false);
    }
  };

  const showAddressModal = (address = null) => {
    setEditingAddress(address);
    
    if (address) {
      addressForm.setFieldsValue({
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        isDefault: address.isDefault
      });
    } else {
      addressForm.resetFields();
      addressForm.setFieldsValue({
        isDefault: false
      });
    }
    
    setIsAddressModalVisible(true);
  };

  const handleAddressSubmit = async (values) => {
    setSavingAddress(true);
    try {
      if (editingAddress) {
        // Mô phỏng cập nhật địa chỉ
        // await apiClient.put(`/api/users/addresses/${editingAddress.id}`, values);
        
        // Cập nhật state local
        const updatedAddresses = userProfile.addressDTOs.map(addr => 
          addr.id === editingAddress.id ? { ...addr, ...values } : 
          values.isDefault && addr.id !== editingAddress.id ? { ...addr, isDefault: false } : addr
        );
        
        setUserProfile({
          ...userProfile,
          addressDTOs: updatedAddresses
        });
        
        message.success('Cập nhật địa chỉ thành công');
      } else {
        // Mô phỏng thêm địa chỉ mới
        // const response = await apiClient.post('/api/users/addresses', values);
        // const newAddress = response.data;
        
        // Mô phỏng tạo địa chỉ mới với ID giả
        const newAddress = {
          id: `new-address-${Date.now()}`,
          ...values
        };
        
        // Cập nhật state local
        const updatedAddresses = values.isDefault 
          ? userProfile.addressDTOs.map(addr => ({ ...addr, isDefault: false }))
          : [...userProfile.addressDTOs];
        
        setUserProfile({
          ...userProfile,
          addressDTOs: [...updatedAddresses, newAddress]
        });
        
        message.success('Thêm địa chỉ mới thành công');
      }
      
      setIsAddressModalVisible(false);
    } catch (error) {
      console.error('Error saving address:', error);
      message.error('Lưu địa chỉ thất bại');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      // Mô phỏng API call
      // await apiClient.put(`/api/users/addresses/${addressId}/default`);
      
      // Cập nhật state local
      const updatedAddresses = userProfile.addressDTOs.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));
      
      setUserProfile({
        ...userProfile,
        addressDTOs: updatedAddresses
      });
      
      message.success('Đã đặt làm địa chỉ mặc định');
    } catch (error) {
      console.error('Error setting default address:', error);
      message.error('Không thể đặt làm địa chỉ mặc định');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      // Mô phỏng API call
      // await apiClient.delete(`/api/users/addresses/${addressId}`);
      
      // Cập nhật state local
      const updatedAddresses = userProfile.addressDTOs.filter(addr => addr.id !== addressId);
      
      setUserProfile({
        ...userProfile,
        addressDTOs: updatedAddresses
      });
      
      message.success('Xóa địa chỉ thành công');
    } catch (error) {
      console.error('Error deleting address:', error);
      message.error('Xóa địa chỉ thất bại');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const createdDate = userProfile?.createdAt 
    ? moment(userProfile.createdAt).format('DD/MM/YYYY') 
    : 'N/A';

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Title level={2} className="mb-0 font-bold">Thông tin cá nhân</Title>
          <Text type="secondary">Quản lý thông tin cá nhân và địa chỉ giao hàng</Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="md:col-span-1">
            <Card className="shadow-sm mb-6">
              <div className="flex flex-col items-center text-center">
                <Avatar 
                  size={96} 
                  icon={<UserOutlined />} 
                  className="bg-indigo-500 mb-4"
                />
                <Title level={3} className="mb-1">{userProfile.fullName}</Title>
                <Text type="secondary" className="mb-2">{userProfile.email}</Text>
                <div className="text-sm text-gray-500 mt-2">
                  Thành viên từ {createdDate}
                </div>
              </div>
            </Card>
            
            <Card className="shadow-sm">
              <div>
                <Title level={4} className="mb-4">Hoạt động gần đây</Title>
                <div className="text-center py-6 text-gray-500">
                  <EnvironmentOutlined style={{ fontSize: '36px', color: '#d9d9d9' }} />
                  <p className="mt-2">Chưa có hoạt động gần đây</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <Card className="shadow-sm">
              <Tabs defaultActiveKey="profile">
                <TabPane 
                  tab={
                    <span className="flex items-center">
                      <UserOutlined className="mr-2" />
                      Thông tin cá nhân
                    </span>
                  } 
                  key="profile"
                >
                  <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleProfileUpdate}
                    className="max-w-lg"
                  >
                    <Form.Item
                      name="fullName"
                      label="Họ và tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                    >
                      <Input />
                    </Form.Item>
                    
                    <Form.Item
                      name="username"
                      label="Tên đăng nhập"
                    >
                      <Input disabled />
                    </Form.Item>
                    
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' }
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    
                    <Form.Item
                      name="gender"
                      label="Giới tính"
                    >
                      <Select>
                        <Option value="male">Nam</Option>
                        <Option value="female">Nữ</Option>
                        <Option value="other">Khác</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      name="birthDate"
                      label="Ngày sinh"
                    >
                      <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={savingProfile} 
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Cập nhật thông tin
                      </Button>
                    </Form.Item>
                  </Form>
                </TabPane>
                
                <TabPane 
                  tab={
                    <span className="flex items-center">
                      <LockOutlined className="mr-2" />
                      Đổi mật khẩu
                    </span>
                  } 
                  key="password"
                >
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordChange}
                    className="max-w-lg"
                  >
                    <Form.Item
                      name="currentPassword"
                      label="Mật khẩu hiện tại"
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                    >
                      <Input.Password />
                    </Form.Item>
                    
                    <Form.Item
                      name="newPassword"
                      label="Mật khẩu mới"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    
                    <Form.Item
                      name="confirmPassword"
                      label="Xác nhận mật khẩu mới"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={savingPassword}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Đổi mật khẩu
                      </Button>
                    </Form.Item>
                  </Form>
                </TabPane>
                
                <TabPane 
                  tab={
                    <span className="flex items-center">
                      <EnvironmentOutlined className="mr-2" />
                      Địa chỉ giao hàng
                    </span>
                  } 
                  key="addresses"
                >
                  <div className="mb-4 flex justify-between items-center">
                    <Title level={4} className="mb-0">Địa chỉ của bạn</Title>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={() => showAddressModal()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Thêm địa chỉ mới
                    </Button>
                  </div>
                  
                  {userProfile.addressDTOs && userProfile.addressDTOs.length > 0 ? (
                    <List
                      itemLayout="vertical"
                      dataSource={userProfile.addressDTOs}
                      renderItem={address => (
                        <List.Item
                          key={address.id}
                          className="border rounded-lg p-4 mb-4 bg-white"
                          actions={[
                            <Button 
                              key="edit" 
                              type="link" 
                              onClick={() => showAddressModal(address)}
                              icon={<EditOutlined />}
                            >
                              Sửa
                            </Button>,
                            !address.isDefault && (
                              <Button 
                                key="setDefault" 
                                type="link" 
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="text-green-600"
                                icon={<CheckCircleOutlined />}
                              >
                                Đặt mặc định
                              </Button>
                            ),
                            !address.isDefault && (
                              <Popconfirm
                                title="Bạn có chắc muốn xóa địa chỉ này?"
                                onConfirm={() => handleDeleteAddress(address.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Button 
                                  key="delete" 
                                  type="link" 
                                  danger
                                  icon={<DeleteOutlined />}
                                >
                                  Xóa
                                </Button>
                              </Popconfirm>
                            )
                          ]}
                        >
                          <div className="flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <Text strong>{address.fullName}</Text>
                                <Text className="mx-2">|</Text>
                                <Text>{address.phone}</Text>
                              </div>
                              {address.isDefault && (
                                <Tag color="green">Mặc định</Tag>
                              )}
                            </div>
                            <Text>{address.address}</Text>
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <EnvironmentOutlined style={{ fontSize: '32px', color: '#d9d9d9' }} />
                      <p className="mt-2 text-gray-500">Bạn chưa có địa chỉ nào</p>
                      <Button 
                        onClick={() => showAddressModal()} 
                        type="primary" 
                        className="mt-3 bg-indigo-600 hover:bg-indigo-700"
                      >
                        Thêm địa chỉ mới
                      </Button>
                    </div>
                  )}
                </TabPane>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        title={editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
        open={isAddressModalVisible}
        onCancel={() => setIsAddressModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={handleAddressSubmit}
        >
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên người nhận' }]}
          >
            <Input placeholder="Nhập họ tên người nhận" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Địa chỉ chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
          >
            <Input.TextArea 
              placeholder="Ví dụ: Số 20, Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh" 
              rows={3} 
            />
          </Form.Item>
          
          <Form.Item name="isDefault" valuePropName="checked">
            <Radio.Group>
              <Radio value={true}>Đặt làm địa chỉ mặc định</Radio>
              <Radio value={false}>Địa chỉ thông thường</Radio>
            </Radio.Group>
          </Form.Item>
          
          <div className="flex justify-end">
            <Button 
              className="mr-2" 
              onClick={() => setIsAddressModalVisible(false)}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={savingAddress}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {editingAddress ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;