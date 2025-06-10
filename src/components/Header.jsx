import {
  AutoComplete,
  Button,
  Dropdown,
  Input,
  Space,
  Tooltip,
  Avatar,
  Spin,
  Tag,
  Divider,
} from "antd";
import { useContext, useMemo, useState, useEffect } from "react";
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
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import apiClient from "../services/apiClient";
import debounce from "lodash.debounce";

const Header = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Tạo debounced search function để tránh gọi API quá nhiều
  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchText) => {
        if (searchText.trim() === "") {
          setOptions([]);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          // Gọi API tìm kiếm sản phẩm
          const response = await apiClient.post(
            `/api/products/search?name=${searchText}&size=20`
          );

          if (response.data && response.data.data) {
            const products = response.data.data.products;

            // Format kết quả tìm kiếm với hình ảnh và giá
            setOptions(
              products.map((product) => ({
                value: product.name,
                label: (
                  <div className="flex items-center py-2">
                    <Avatar
                      src={product.cover}
                      size={40}
                      shape="square"
                      className="mr-3"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">
                        {product.name}
                      </span>
                      <span className="text-xs text-rose-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(product.price)}
                      </span>
                    </div>
                  </div>
                ),
                key: product.id,
                slug: product.slug,
              }))
            );
          }
        } catch (error) {
          console.error("Lỗi khi tìm kiếm sản phẩm:", error);
          // Nếu API lỗi, hiển thị gợi ý đơn giản
          setOptions([
            {
              value: searchText,
              label: (
                <div className="flex items-center">
                  <SearchOutlined className="mr-2 text-gray-400" />
                  <span>Tìm "{searchText}"</span>
                </div>
              ),
              key: "search",
              isSearchQuery: true,
            },
          ]);
        } finally {
          setLoading(false);
        }
      }, 500),
    []
  );

  // Xử lý thay đổi giá trị tìm kiếm
  const handleSearchChange = (value) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  // Xử lý khi chọn một sản phẩm hoặc nhấn tìm kiếm
  const handleSelect = (value, option) => {
    if (option.isSearchQuery) {
      // Nếu chọn "Tìm kiếm...", chuyển đến trang tìm kiếm
      navigate(`/search?query=${encodeURIComponent(value)}`);
    } else if (option.slug) {
      // Nếu chọn một sản phẩm cụ thể, chuyển đến trang sản phẩm đó
      navigate(`/products/${option.slug}`);
    }
  };

  // Xử lý khi nhấn enter hoặc nút tìm kiếm
  const handleSearch = (value) => {
    if (value.trim() === "") {
      return;
    }
    navigate(`/search?query=${encodeURIComponent(value)}`);
  };

  // Xóa kết quả tìm kiếm khi component unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await apiClient.get("/api/categories?size=10");
        if (response.data && response.data.data.categories) {
          setCategories(response.data.data.categories);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categorySlug, categoryName) => {
    navigate(`/products?category=${categorySlug}`, {
      state: { categoryName },
    });
  };

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

  return (
    <header className="w-full flex flex-col items-center border-[1px] border-solid rounded-b-xl border-gray-200 bg-white shadow-md">
      <div className="w-full mx-auto px-10">
        {/* Phần trên: Logo, Search, User/Cart icons */}
        <div className="">
          <div className="flex flex-row justify-between items-center">
            {/* Logo */}
            <div className="flex-none">
              <button onClick={() => navigate("/")} className="cursor-pointer">
                <img src={logo} alt="e-commerce logo" width={80} />
              </button>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 flex justify-center">
              <nav className="flex space-x-8">
                <Link
                  to="/products?isBestseller=true"
                  className="text-gray-700 hover:text-indigo-600 font-medium text-base transition-colors"
                >
                  Bán chạy nhất
                </Link>
                <Link
                  to="/products?isNew=true"
                  className="text-gray-700 hover:text-indigo-600 font-medium text-base transition-colors"
                >
                  Mới
                </Link>
                <Link
                  to="/products?isFeatured=true"
                  className="text-gray-700 hover:text-indigo-600 font-medium text-base transition-colors"
                >
                  Nổi bật
                </Link>
                <Link
                  to="/products?category=nam"
                  className="text-gray-700 hover:text-indigo-600 font-medium text-base transition-colors"
                >
                  Nam
                </Link>
                <Link
                  to="/products?category=nu"
                  className="text-gray-700 hover:text-indigo-600 font-medium text-base transition-colors"
                >
                  Nữ
                </Link>
              </nav>
            </div>

            {/* Search Bar and User/Cart Icons */}
            <div className="flex-none flex items-center space-x-4">
              {/* Search Bar */}
              <div className="w-[280px]">
                <AutoComplete
                  className="w-full"
                  options={options}
                  onSelect={handleSelect}
                  onSearch={handleSearchChange}
                  value={searchValue}
                  notFoundContent={
                    loading ? <Spin size="small" /> : "Không tìm thấy sản phẩm"
                  }
                  dropdownMatchSelectWidth={280}
                >
                  <Input.Search
                    placeholder="Tìm kiếm sản phẩm..."
                    variant="outlined"
                    value={searchValue}
                    onSearch={handleSearch}
                    onChange={(e) => setSearchValue(e.target.value)}
                    allowClear={true}
                    size="middle"
                    loading={loading}
                  />
                </AutoComplete>
              </div>

              {/* User/Cart Icons */}
              {auth.isAuthenticated ? (
                <div className="flex items-center gap-x-3">
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
                      className="hover:shadow-md transition-all"
                      style={{
                        borderColor: "#4F46E5",
                        color: "#4F46E5",
                        fontSize: "20px",
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
                        fontSize: "20px",
                      }}
                    />
                  </Tooltip>
                </div>
              ) : (
                <Button
                  onClick={() => navigate("/login")}
                  type="primary"
                  style={{
                    backgroundColor: "#4F46E5",
                    fontWeight: "bold",
                  }}
                  className="text-[#F5F5F5]"
                  icon={<LoginOutlined />}
                >
                  Đăng nhập
                </Button>
              )}
            </div>
          </div>
        </div>
        {/* Divider phân cách hai phần */}
        <Divider className="my-0" type="horizontal" size="small" />

        {/* Phần dưới: Danh sách Categories */}
        <div className="">
          <div className="flex flex-wrap gap-2 justify-center pt-2 pb-4 w-full">
            {categoriesLoading ? (
              <Spin size="small" />
            ) : (
              categories.map((category) => (
                <Tag
                  key={category.id}
                  color="#4F46E5"
                  icon={<TagOutlined />}
                  className="cursor-pointer px-3 text-sm whitespace-nowrap"
                  onClick={() =>
                    handleCategoryClick(category.slug, category.name)
                  }
                >
                  {category.name}
                </Tag>
              ))
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
