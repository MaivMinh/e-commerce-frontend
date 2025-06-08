import { AutoComplete, Button, Dropdown, Input, Space, Tooltip } from "antd";
import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import {
  FileTextFilled,
  LoginOutlined,
  LogoutOutlined,
  OrderedListOutlined,
  ProfileOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import apiClient from "../services/apiClient";

const Header = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState([]);

  const userMenuItems = [
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/profile"),
    },
    {
      key: "orders",
      icon: <OrderedListOutlined />,
      label: "Đơn hàng của tôi",
      onClick: () => navigate("/orders"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: logout,
    },
  ];

  const [arrow, setArrow] = useState("Show");
  const mergedArrow = useMemo(() => {
    if (arrow === "Hide") {
      return false;
    }
    if (arrow === "Show") {
      return true;
    }
    return {
      pointAtCenter: true,
    };
  }, [arrow]);

  const handleSearch = (value) => {
    if (value.trim() === "") {
      return;
    }
    // Navigate to search results page with the search query
    navigate(`/search?query=${encodeURIComponent(value)}`);
  };

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("access-token");
      await apiClient.post(`/api/auth/logout?token=${accessToken}`);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      logout();
      navigate("/login");
    }
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);

    /// Điều này được thay thế bằng việc gọi API để lấy gợi ý tìm kiếm.
    /// Ví dụ: apiClient.get(`/api/products/search?keyword=${value}`)

    if (value.trim() === "") {
      setOptions([]);
      return;
    } else {
      const mockSuggestions = [
        `${value} áo thun`,
        `${value} quần jean`,
        `${value} giày`,
        `${value} túi xách`,
      ];

      setOptions(
        mockSuggestions.map((item) => ({
          value: item,
          label: (
            <div className="flex items-center">
              <SearchOutlined className="mr-2 text-gray-400" />
              <span>{item}</span>
            </div>
          ),
        }))
      );
    }
  };

  return (
    <header className="w-full min-h-24 flex flex-row items-center border-[1px] border-solid rounded-b-xl border-gray-200 bg-white shadow-md">
      <div className="w-full h-full mx-auto px-10">
        <nav className="flex flex-row justify-between items-center">
          <button onClick={() => navigate("/")} className="cursor-pointer">
            <img src={logo} alt="e-commerce logo" width={80} />
          </button>
          <div className="flex flex-row justify-center items-center min-w-[600px] mx-auto gap-x-10">
            <AutoComplete
              className="w-full"
              options={options}
              onSelect={handleSearch}
              onSearch={handleSearchChange}
              value={searchValue}
            >
              <Input.Search
                placeholder="Tìm kiếm quần áo, trang sức và nhiều hơn nữa..."
                variant="outlined"
                value={searchValue}
                onSearch={handleSearch}
                onChange={(e) => setSearchValue(e.target.value)}
                allowClear={true}
                size="large"
              />
            </AutoComplete>
          </div>
          <div className="mr-4 flex flex-row justify-end items-center">
            {auth.isAuthenticated ? (
              <div className="flex w-full justify-between items-center gap-x-10">
                <div className="flex flex-row justify-center items-center gap-x-4">
                  <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    trigger={["hover"]}
                    overlayClassName="user-dropdown-menu"
                  >
                    <Button
                      icon={<UserOutlined />}
                      shape="circle"
                      size="large"
                      className="user-profile-button hover:shadow-md transition-all"
                      style={{
                        borderColor: "#4F46E5",
                        color: "#4F46E5",
                        fontSize: "22px",
                      }}
                    />
                  </Dropdown>

                  <Tooltip
                    placement="bottom"
                    title={"Giỏ hàng"}
                    arrow={mergedArrow}
                  >
                    <Button
                      icon={<ShoppingCartOutlined />}
                      onClick={() => navigate("/cart")}
                      shape="circle"
                      size="large"
                      style={{
                        borderColor: "#fa8c16",
                        color: "#fa8c16",
                        fontSize: "22px",
                      }}
                    />
                  </Tooltip>
                </div>
                {/* Remove the separate logout button since it's now in the dropdown */}
              </div>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                type="primary"
                style={{
                  backgroundColor: "#4F46E5",
                  fontWeight: "bold",
                  padding: "16px 12px",
                }}
                className="text-[#F5F5F5]"
                icon={<LoginOutlined />}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
