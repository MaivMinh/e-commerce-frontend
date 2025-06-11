import React, { useState, useEffect, useRef, useContext } from "react";
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
  Modal,
  Radio,
  message,
  Popconfirm,
  Spin,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  CameraOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import moment from "moment";
import apiClient from "../../services/apiClient";
import dayjs from "dayjs";
import { AuthContext } from "../../context/AuthContext";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Profile = () => {
  const { refreshProfile, auth } = useContext(AuthContext);
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

  // Avatar related states
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef(null);
  const [avatarToBeRemoved, setAvatarToBeRemoved] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/users/profile");
      const data = response.data.data;

      // Đảm bảo avatar có giá trị để tương thích với code cũ
      const updatedData = {
        ...data,
        avatar: data.avatar || data.avatar,
      };

      setUserProfile(updatedData);

      // Set form initial values
      profileForm.setFieldsValue({
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        gender: data.gender,
        birthDate: data.birthDate ? dayjs(data.birthDate) : null,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      message.error("Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // Xử lý khi chọn file avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra loại file
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ chấp nhận file ảnh!");
      return;
    }

    // Kiểm tra kích thước file (giới hạn 2MB)
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return;
    }

    // Preview ảnh trước khi upload
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
      setPreviewVisible(true);
    };
    reader.readAsDataURL(file);
  };

  // Xử lý upload avatar
  const handleUploadAvatar = async () => {
    setPreviewVisible(false);
    setAvatarLoading(true);

    try {
      const fileInput = fileInputRef.current;
      const file = fileInput.files[0];

      if (!file) {
        setAvatarLoading(false);
        return;
      }

      // Bước 1: Upload ảnh lên server files
      const formData = new FormData();
      formData.append("image", file); // Tên trường có thể khác tùy API

      // Gọi API upload ảnh
      const uploadResponse = await apiClient.post(
        "/api/files/images/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Lấy URL ảnh từ response
      const imageUrl = uploadResponse.data.data.url;

      // Bước 2: Cập nhật profile với URL ảnh mới
      const updateResponse = await apiClient.put("/api/users", {
        ...userProfile,
        avatar: imageUrl, // Cập nhật trường avatar trong profileDTO
      });

      // Cập nhật state UI sau khi cập nhật thành công
      setUserProfile({
        ...userProfile,
        avatar: imageUrl,
        avatar: imageUrl, // Giữ avatar cho UI nếu cần
      });

      message.success("Cập nhật ảnh đại diện thành công");

      // Reset file input
      fileInput.value = "";
    } catch (error) {
      console.error("Error uploading avatar:", error);
      message.error("Cập nhật ảnh đại diện thất bại");
    } finally {
      setAvatarLoading(false);
    }
  };

  // Xử lý xóa avatar
  const handleRemoveAvatar = () => {
    // Hiển thị xác nhận
    Modal.confirm({
      title: "Xóa ảnh đại diện",
      content:
        'Bạn có chắc muốn xóa ảnh đại diện? Thay đổi sẽ được áp dụng sau khi bạn nhấn "Cập nhật thông tin".',
      okText: "Xác nhận xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        console.log("Xác nhận xóa avatar"); // Log để debug

        // Chỉ đánh dấu avatar sẽ bị xóa, không gửi API ngay
        setAvatarToBeRemoved(true);

        // Cập nhật UI để hiển thị avatar đã bị đánh dấu xóa
        setUserProfile((prevProfile) => {
          console.log("Cập nhật profile với tempAvatarRemoved: true"); // Log để debug
          return {
            ...prevProfile,
            tempAvatarRemoved: true,
          };
        });

        message.info("Nhấn 'Cập nhật thông tin' để xác nhận thay đổi");
      },
    });
  };

  const handleDirectRemoveAvatar = async () => {
    setAvatarLoading(true);
    try {
      // Gọi API cập nhật trực tiếp
      const response = await apiClient.put("/api/users", {
        ...userProfile,
        avatar: null,
      });

      // Cập nhật UI
      setUserProfile({
        ...userProfile,
        avatar: null,
        avatar: null,
        tempAvatarRemoved: false,
      });

      setAvatarToBeRemoved(false);
      message.success("Đã xóa ảnh đại diện");
    } catch (error) {
      console.error("Error removing avatar:", error);
      message.error("Không thể xóa ảnh đại diện");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleProfileUpdate = async (values) => {
    setSavingProfile(true);
    try {
      // Xây dựng payload với đầy đủ thông tin
      const payload = {
        ...values,
        birthDate: values.birthDate
          ? values.birthDate.format("YYYY-MM-DD")
          : null,
      };

      // Chỉ set avatar = null khi người dùng đã xác nhận xóa avatar
      if (avatarToBeRemoved) {
        payload.avatar = null;
      } else {
        // Giữ nguyên avatar hiện tại
        payload.avatar = userProfile.avatar;
      }

      // Gọi API cập nhật
      await apiClient.put("/api/users", payload);

      // Reset trạng thái xóa avatar
      setAvatarToBeRemoved(false);

      // Làm mới thông tin profile từ AuthContext
      refreshProfile();

      // Tải lại thông tin profile cho component này
      fetchUserProfile();
      message.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Cập nhật thông tin thất bại");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setSavingPassword(true);
    try {
      // Chuẩn bị payload theo đúng cấu trúc ChangePasswordDTO
      const payload = {
        accountId: auth.accountId,
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword,
      };

      if (payload.newPassword !== payload.confirmNewPassword) {
        message.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
        return;
      }

      // Gọi API đổi mật khẩu
      await apiClient.post("/api/auth/change-password", payload);

      // Hiển thị thông báo thành công
      message.success("Đổi mật khẩu thành công");

      // Reset form sau khi đổi mật khẩu thành công
      passwordForm.resetFields();
    } catch (error) {
      console.error("Error changing password:", error);

      // Xử lý các loại lỗi phổ biến
      if (error.response) {
        if (error.response.status === 401) {
          message.error("Mật khẩu hiện tại không chính xác");
        } else if (error.response.status === 400) {
          message.error(
            error.response.data.message ||
              "Mật khẩu mới và xác nhận mật khẩu không khớp"
          );
        } else {
          message.error(error.response.data.message || "Đổi mật khẩu thất bại");
        }
      } else {
        message.error("Đổi mật khẩu thất bại. Vui lòng thử lại sau.");
      }
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
        isDefault: address.isDefault,
      });
    } else {
      addressForm.resetFields();
      addressForm.setFieldsValue({
        isDefault: false,
      });
    }

    setIsAddressModalVisible(true);
  };

  const handleAddressSubmit = async (values) => {
    setSavingAddress(true);
    try {
      if (editingAddress) {
        // Cập nhật địa chỉ hiện có
        const payload = {
          id: editingAddress.id,
          userId: userProfile.id,
          fullName: values.fullName,
          phone: values.phone,
          address: values.address,
          isDefault: values.isDefault,
        };

        await apiClient.put(`/api/users/addresses`, payload);
        message.success("Cập nhật địa chỉ thành công");
      } else {
        // Thêm địa chỉ mới
        const payload = {
          userId: userProfile.id,
          fullName: values.fullName,
          phone: values.phone,
          address: values.address,
          isDefault: values.isDefault,
        };

        await apiClient.post("/api/users/addresses", payload);
        message.success("Thêm địa chỉ mới thành công");
      }

      // Làm mới thông tin profile từ AuthContext
      refreshProfile();

      // Tải lại thông tin profile cho component này
      await fetchUserProfile();

      setIsAddressModalVisible(false);
    } catch (error) {
      console.error("Error saving address:", error);
      message.error(error.response?.data?.message || "Lưu địa chỉ thất bại");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      // Lấy thông tin địa chỉ từ state
      const addressToSetDefault = userProfile.addressDTOs.find(
        (addr) => addr.id === addressId
      );

      if (!addressToSetDefault) {
        message.error("Địa chỉ không tồn tại");
        return;
      }

      // Gửi request cập nhật địa chỉ mặc định
      await apiClient.put("/api/users/addresses", {
        ...addressToSetDefault,
        isDefault: true,
      });

      // Làm mới thông tin profile từ AuthContext
      refreshProfile();

      // Tải lại thông tin profile cho component này
      await fetchUserProfile();

      message.success("Đã đặt làm địa chỉ mặc định");
    } catch (error) {
      console.error("Error setting default address:", error);
      message.error("Không thể đặt làm địa chỉ mặc định");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await apiClient.delete(`/api/users/addresses/${addressId}`);

      // Làm mới thông tin profile từ AuthContext
      refreshProfile();

      // Tải lại thông tin profile cho component này
      await fetchUserProfile();

      message.success("Xóa địa chỉ thành công");
    } catch (error) {
      console.error("Error deleting address:", error);
      message.error("Xóa địa chỉ thất bại");
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
    ? moment(userProfile.createdAt).format("DD/MM/YYYY")
    : "N/A";

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Title level={2} className="mb-0 font-bold">
            Thông tin cá nhân
          </Title>
          <Text type="secondary">
            Quản lý thông tin cá nhân và địa chỉ giao hàng
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="md:col-span-1">
            <Card className="shadow-sm mb-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar với chức năng upload */}
                <div className="relative">
                  {avatarLoading ? (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <LoadingOutlined style={{ fontSize: 24 }} />
                    </div>
                  ) : (
                    <div
                      className="relative group cursor-pointer"
                      onClick={handleAvatarClick}
                    >
                      <Avatar
                        size={96}
                        src={
                          userProfile.tempAvatarRemoved
                            ? null
                            : userProfile.avatar || userProfile.avatar
                        }
                        icon={
                          (userProfile.tempAvatarRemoved ||
                            (!userProfile.avatar && !userProfile.avatar)) && (
                            <UserOutlined />
                          )
                        }
                        className="bg-indigo-500 mb-4"
                      />
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <CameraOutlined
                          style={{ fontSize: "24px", color: "white" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Input file ẩn */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />

                  {/* Hiển thị nút xóa avatar nếu có avatar */}
                  {!userProfile.tempAvatarRemoved &&
                    (userProfile.avatar || userProfile.avatar) && (
                      <div>
                        <Button
                          size="small"
                          danger
                          onClick={handleDirectRemoveAvatar}
                          className="mt-2"
                        >
                          Xóa ngay
                        </Button>
                      </div>
                    )}
                </div>

                <Title level={3} className="mb-1">
                  {userProfile.fullName}
                </Title>
                <Text type="secondary" className="mb-2">
                  {userProfile.email}
                </Text>
                <div className="text-sm text-gray-500 mt-2">
                  Thành viên từ {createdDate}
                </div>
              </div>
            </Card>

            <Card className="shadow-sm">
              <div>
                <Title level={4} className="mb-4">
                  Hoạt động gần đây
                </Title>
                <div className="text-center py-6 text-gray-500">
                  <EnvironmentOutlined
                    style={{ fontSize: "36px", color: "#d9d9d9" }}
                  />
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
                    <Form.Item name="id" noStyle initialValue={userProfile.id}>
                      <Input type="hidden" />
                    </Form.Item>

                    <Form.Item
                      name="fullName"
                      label="Họ và tên"
                      rules={[
                        { required: true, message: "Vui lòng nhập họ và tên" },
                      ]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item name="username" label="Tên đăng nhập">
                      <Input disabled />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                      ]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item name="gender" label="Giới tính">
                      <Select>
                        <Option value="male">Nam</Option>
                        <Option value="female">Nữ</Option>
                        <Option value="other">Khác</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name="birthDate" label="Ngày sinh">
                      <DatePicker
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                      />
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
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mật khẩu hiện tại",
                        },
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>

                    <Form.Item
                      name="newPassword"
                      label="Mật khẩu mới"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mật khẩu mới",
                        },
                        { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      label="Xác nhận mật khẩu mới"
                      dependencies={["newPassword"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng xác nhận mật khẩu mới",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              !value ||
                              getFieldValue("newPassword") === value
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Mật khẩu xác nhận không khớp")
                            );
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
                    <Title level={4} className="mb-0">
                      Địa chỉ của bạn
                    </Title>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => showAddressModal()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Thêm địa chỉ mới
                    </Button>
                  </div>

                  {userProfile.addressDTOs &&
                  userProfile.addressDTOs.length > 0 ? (
                    <List
                      itemLayout="vertical"
                      dataSource={userProfile.addressDTOs}
                      renderItem={(address) => (
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
                                onClick={() =>
                                  handleSetDefaultAddress(address.id)
                                }
                                className="text-green-600"
                                icon={<CheckCircleOutlined />}
                              >
                                Đặt mặc định
                              </Button>
                            ),
                            !address.isDefault && (
                              <Popconfirm
                                title="Bạn có chắc muốn xóa địa chỉ này?"
                                onConfirm={() =>
                                  handleDeleteAddress(address.id)
                                }
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
                            ),
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
                      <EnvironmentOutlined
                        style={{ fontSize: "32px", color: "#d9d9d9" }}
                      />
                      <p className="mt-2 text-gray-500">
                        Bạn chưa có địa chỉ nào
                      </p>
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

      {userProfile.tempAvatarRemoved && (
        <div className="mt-2 text-red-500 text-xs">
          Ảnh sẽ bị xóa sau khi bạn cập nhật thông tin
          <Button
            size="small"
            type="link"
            onClick={() => {
              setAvatarToBeRemoved(false);
              setUserProfile({
                ...userProfile,
                tempAvatarRemoved: false,
              });
            }}
          >
            Hủy xóa
          </Button>
        </div>
      )}

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
          <Form.Item name="id" noStyle initialValue={editingAddress?.id}>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên người nhận" },
            ]}
          >
            <Input placeholder="Nhập họ tên người nhận" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ chi tiết"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ chi tiết" },
            ]}
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

      {/* Preview Image Modal */}
      <Modal
        open={previewVisible} // Thay visible thành open để phù hợp với Ant Design v5
        title="Xem trước ảnh đại diện"
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleUploadAvatar}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Sử dụng ảnh này
          </Button>,
        ]}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default Profile;
