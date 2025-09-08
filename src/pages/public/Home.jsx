import React, { useState, useEffect, useContext } from "react";
import {
  Carousel,
  Card,
  Button,
  Pagination,
  Spin,
  Typography,
  Skeleton,
} from "antd";
import {
  ShoppingCartOutlined,
  EyeOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import apiClient from "../../services/apiClient.js";
import { Link, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Meta } = Card;

const Home = () => {
  document.title = "Trang chủ | E-commerce Shop";
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const pageSize = 8;

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [totalCategories, setTotalCategories] = useState(0);
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);
  const categoryPageSize = 16; // 8 categories mỗi trang
  const [changingCategoryPage, setChangingCategoryPage] = useState(false);

  const carouselImages = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Sản phẩm mới nhất",
      subtitle: "Khám phá xu hướng thời trang mới nhất",
      buttonText: "Mua sắm ngay",
      link: "/products",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Giảm giá lên đến 50%",
      subtitle: "Ưu đãi đặc biệt cho thành viên mới",
      buttonText: "Xem ngay",
      link: "/products",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      title: "Bộ sưu tập mùa hè",
      subtitle: "Phong cách sành điệu cho mùa mới",
      buttonText: "Khám phá",
      link: "/products",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(
          `/api/products/newest?page=${currentPage}&size=${pageSize}`
        );
        setProducts(response.data.data);
        setTotalProducts(response.data.data.totalElements);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, pageSize]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await apiClient.get(
          `/api/categories?page=${currentCategoryPage}&size=${categoryPageSize}`
        );

        setCategories(response.data.data);
        setTotalCategories(response.data.data.totalElements || 0);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setTimeout(() => {
          setCategoriesLoading(false);
        }, 1000);
      }
    };

    fetchCategories();
  }, [currentCategoryPage]);

  // Thêm useEffect để reset changingCategoryPage khi dữ liệu categories được cập nhật
  useEffect(() => {
    if (!categoriesLoading && changingCategoryPage) {
      setChangingCategoryPage(false);
    }
  }, [categories, categoriesLoading]);

  const skeletonArray = Array(categoryPageSize).fill(null);
  const CategorySkeletonCard = () => (
    <div className="cursor-not-allowed">
      <Card
        cover={<Skeleton.Image className="h-32 w-full" active={true} />}
        bodyStyle={{ padding: "12px", textAlign: "center" }}
        className="border border-gray-100"
      >
        <Skeleton active paragraph={{ rows: 1 }} title={false} />
      </Card>
    </div>
  );

  // Handler cho phân trang categories
  const handleCategoryPageChange = (page) => {
    // Đánh dấu bắt đầu chuyển trang và hiển thị skeleton
    setChangingCategoryPage(true);
    setCurrentCategoryPage(page);
    window.scrollTo({ top: 550, behavior: "smooth" });
  };

  // Handler khi click vào category
  const handleCategoryClick = (categorySlug, categoryName) => {
    navigate(`/products?category=${categorySlug}`, {
      state: { categoryName },
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Định dạng giá không làm tròn
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.floor(price)); // Sử dụng Math.floor để cắt bỏ phần thập phân thay vì làm tròn
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Carousel */}
      <Carousel autoplay effect="fade" className="h-[500px] bg-gray-200">
        {carouselImages.map((item) => (
          <div key={item.id} className="relative h-[500px]">
            <div
              className="w-full h-full bg-center bg-cover"
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className="absolute inset-0 bg-black/30 flex items-center">
                <div className="container mx-auto px-6 md:px-12">
                  <div className="max-w-lg">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      {item.title}
                    </h2>
                    <p className="text-xl text-white/90 mb-8">
                      {item.subtitle}
                    </p>
                    <Button
                      type="primary"
                      size="large"
                      href={item.link}
                      className="h-12 px-8 text-lg"
                      style={{
                        backgroundColor: "#4F46E5",
                        borderColor: "#4F46E5",
                      }}
                    >
                      {item.buttonText}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Hiển thị danh sách các category có phân trang */}
      {/* Hiển thị danh sách các category có phân trang */}
      {categoriesLoading ? (
        <div className="flex justify-center py-10 min-h-[400px]">
          <Spin size="large" />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-12 min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <Title level={2} className="m-0">
              Danh mục sản phẩm
            </Title>
            <Link
              to={"/products"}
              className="text-indigo-600 hover:text-purple-900 font-semibold text-lg"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-6">
            {/* Hàng 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {changingCategoryPage
                ? skeletonArray
                    .slice(0, 8)
                    .map((_, index) => (
                      <CategorySkeletonCard key={`skeleton-1-${index}`} />
                    ))
                : categories
                    .slice(0, Math.ceil(categories.length / 2))
                    .map((category) => (
                      <div
                        key={category.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-300"
                        onClick={() =>
                          handleCategoryClick(category.slug, category.name)
                        }
                      >
                        <Card
                          hoverable
                          cover={
                            <div className="overflow-hidden h-32">
                              <img
                                alt={category.name}
                                src={category.image || ``}
                                className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
                              />
                            </div>
                          }
                          bodyStyle={{ padding: "12px", textAlign: "center" }}
                          className="border border-gray-100"
                        >
                          <Text
                            strong
                            className="text-sm text-gray-800 line-clamp-2 h-10"
                          >
                            {category.name}
                          </Text>
                        </Card>
                      </div>
                    ))}
            </div>

            {/* Hàng 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {changingCategoryPage
                ? skeletonArray
                    .slice(0, 8)
                    .map((_, index) => (
                      <CategorySkeletonCard key={`skeleton-2-${index}`} />
                    ))
                : categories
                    .slice(Math.ceil(categories.length / 2))
                    .map((category) => (
                      <div
                        key={category.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-300"
                        onClick={() =>
                          handleCategoryClick(category.slug, category.name)
                        }
                      >
                        <Card
                          hoverable
                          cover={
                            <div className="overflow-hidden h-32">
                              <img
                                alt={category.name}
                                src={category.image || ``}
                                className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
                                onError={(e) => {
                                  e.target.src = ``;
                                }}
                              />
                            </div>
                          }
                          bodyStyle={{ padding: "12px", textAlign: "center" }}
                          className="border border-gray-100"
                        >
                          <Text
                            strong
                            className="text-sm text-gray-800 line-clamp-2 h-10"
                          >
                            {category.name}
                          </Text>
                        </Card>
                      </div>
                    ))}
            </div>
          </div>

          {totalCategories > categoryPageSize && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentCategoryPage}
                total={totalCategories}
                pageSize={categoryPageSize}
                onChange={handleCategoryPageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      )}

      {/* Newest Products Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <Title level={2} className="m-0">
            Sản phẩm mới nhất
          </Title>
          <Link
            to={"/products"}
            className="text-indigo-600 hover:text-purple-900 font-semibold text-lg"
          >
            Xem tất cả
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products &&
                products.slice(0, pageSize).map((product) => (
                  <Card
                    key={product.id}
                    onClick={() => navigate("/products/" + product.slug)}
                    hoverable
                    cover={
                      <div className="relative pt-[100%] overflow-hidden">
                        <img
                          alt={product.name}
                          src={product.cover}
                          className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105"
                        />
                        {product.discount > 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                            -{product.discount}%
                          </div>
                        )}
                      </div>
                    }
                    actions={[
                      <HeartOutlined key="favorite" />,
                      <EyeOutlined key="view" />,
                      <ShoppingCartOutlined key="add-to-cart" />,
                    ]}
                    className="border border-gray-200 h-full"
                    bodyStyle={{ padding: "16px" }}
                  >
                    <Meta
                      title={
                        <a
                          href={`/product/${product.id}`}
                          className="text-gray-800 hover:text-indigo-600"
                        >
                          {product.name}
                        </a>
                      }
                      description={
                        <div className="mt-2">
                          {product.discount > 0 ? (
                            <div>
                              <Text delete className="text-gray-500 mr-2">
                                {formatPrice(product.price)}
                              </Text>
                              <Text className="text-red-500 font-semibold">
                                {formatPrice(
                                  product.price * (1 - product.discount / 100)
                                )}
                              </Text>
                            </div>
                          ) : (
                            <Text className="text-gray-800 font-semibold">
                              {formatPrice(product.price)}
                            </Text>
                          )}
                        </div>
                      }
                    />
                  </Card>
                ))}
            </div>

            <div className="flex justify-end mt-8">
              <Pagination
                current={currentPage}
                total={totalProducts}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
