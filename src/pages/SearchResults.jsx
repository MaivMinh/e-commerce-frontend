import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { 
  Card, 
  Pagination, 
  Spin, 
  Empty, 
  Typography, 
  Select, 
  Button,
  Rate,
  Tag,
  Tooltip
} from "antd";
import { 
  ShoppingCartOutlined, 
  EyeOutlined, 
  HeartOutlined,
  FireOutlined
} from "@ant-design/icons";
import apiClient from "../services/apiClient";

const { Title, Text } = Typography;
const { Option } = Select;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("query") || "";
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const [pageSize, setPageSize] = useState(12);

  // Set page title
  useEffect(() => {
    document.title = `Kết quả tìm kiếm: ${query} | E-commerce Shop`;
  }, [query]);

  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      try {
        // Xây dựng tham số sort
        let sortParam = "";
        switch (sortBy) {
          case "newest":
            sortParam = "createdAt:desc";
            break;
          case "price_asc":
            sortParam = "price:asc";
            break;
          case "price_desc":
            sortParam = "price:desc";
            break;
          case "rating":
            sortParam = "rating:desc";
            break;
          default:
            sortParam = ""; // Mặc định là relevance
        }

        // Tạo URL với các tham số tìm kiếm
        const url = `/api/products/search?name=${encodeURIComponent(query)}&page=${currentPage - 1}&size=${pageSize}${sortParam ? `&sort=${sortParam}` : ''}`;
        
        // Gọi API search
        const response = await apiClient.post(url);
        
        if (response.data && response.data.data) {
          setProducts(response.data.data.products || []);
          setTotalProducts(response.data.data.totalElements || 0);
        } else {
          setProducts([]);
          setTotalProducts(0);
        }
      } catch (error) {
        console.error("Error searching products:", error);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage, pageSize, sortBy]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-display">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Title level={2} className="font-bold">Kết quả tìm kiếm cho "{query}"</Title>
          <Text className="text-gray-600">Tìm thấy {totalProducts} sản phẩm</Text>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-10 flex justify-center">
            <Spin size="large" />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <Text className="text-gray-600 mb-3 sm:mb-0">
                  Hiển thị {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, totalProducts)} trên{" "}
                  {totalProducts} sản phẩm
                </Text>

                <div className="flex items-center">
                  <Text className="mr-2 text-gray-600 whitespace-nowrap">
                    Sắp xếp theo:
                  </Text>
                  <Select
                    value={sortBy}
                    onChange={(value) => setSortBy(value)}
                    className="w-40"
                    size="middle"
                  >
                    <Option value="relevance">Liên quan</Option>
                    <Option value="newest">Mới nhất</Option>
                    <Option value="price_asc">Giá thấp đến cao</Option>
                    <Option value="price_desc">Giá cao đến thấp</Option>
                    <Option value="rating">Đánh giá cao nhất</Option>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300"
                  bodyStyle={{ padding: "12px 16px" }}
                  cover={
                    <div className="relative pt-[125%] overflow-hidden bg-gray-100">
                      <Link to={`/products/${product.slug}`}>
                        <img
                          src={product.cover}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/300x400/e2e8f0/64748b?text=Không+có+ảnh";
                          }}
                        />
                      </Link>

                      {/* Status Tags */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.isNew && (
                          <div className="bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                            Mới
                          </div>
                        )}
                        {product.originalPrice > product.price && (
                          <div className="bg-rose-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                          </div>
                        )}
                      </div>

                      {product.isBestseller && (
                        <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm flex items-center">
                          <FireOutlined className="mr-1" /> Bán chạy
                        </div>
                      )}

                      {/* Quick Action Buttons */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center gap-2">
                        <Button
                          type="primary"
                          icon={<EyeOutlined />}
                          shape="circle"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/products/${product.slug}`);
                          }}
                          className="bg-white text-gray-800 border-0 hover:bg-indigo-600 hover:text-white shadow-md"
                        />
                        <Button
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          shape="circle"
                          className="bg-white text-gray-800 border-0 hover:bg-indigo-600 hover:text-white shadow-md"
                        />
                        <Button
                          type="primary"
                          icon={<HeartOutlined />}
                          shape="circle"
                          className="bg-white text-gray-800 border-0 hover:bg-indigo-600 hover:text-white shadow-md"
                        />
                      </div>
                    </div>
                  }
                >
                  {/* Color Variants */}
                  {product.productVariants && product.productVariants.length > 0 && (
                    <div className="flex gap-1 mb-2 mt-1">
                      {Array.from(new Set(product.productVariants.map(v => v.colorHex)))
                        .slice(0, 4)
                        .map((color, index) => (
                          <Tooltip 
                            key={index}
                            title={product.productVariants.find(v => v.colorHex === color)?.colorName || "Màu sắc"}
                          >
                            <div
                              className="w-5 h-5 rounded-full cursor-pointer border border-gray-300 shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          </Tooltip>
                        ))}
                      {Array.from(new Set(product.productVariants.map(v => v.colorHex))).length > 4 && (
                        <Tooltip title="Thêm màu sắc khác">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 border border-gray-300">
                            +{Array.from(new Set(product.productVariants.map(v => v.colorHex))).length - 4}
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  )}

                  {/* Product Name */}
                  <Link to={`/products/${product.slug}`}>
                    <Text
                      ellipsis={{ tooltip: product.name }}
                      className="text-sm font-medium text-gray-800 hover:text-indigo-600 transition-colors mb-1 line-clamp-2 h-10"
                    >
                      {product.name}
                    </Text>
                  </Link>

                  {/* Size Variants */}
                  {product.productVariants && product.productVariants.length > 0 && (
                    <div className="flex gap-1 my-1">
                      {Array.from(new Set(product.productVariants.map(v => v.size)))
                        .slice(0, 3)
                        .map((size, index) => (
                          <Tag key={index} className="m-0 text-xs border-gray-200 text-gray-600 bg-gray-50">
                            {size}
                          </Tag>
                        ))}
                      {Array.from(new Set(product.productVariants.map(v => v.size))).length > 3 && (
                        <Tag className="m-0 text-xs border-gray-200 text-gray-600 bg-gray-50">
                          +{Array.from(new Set(product.productVariants.map(v => v.size))).length - 3}
                        </Tag>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center mt-2">
                    <Text className="text-base font-semibold text-rose-600">
                      {formatPrice(product.price)}
                    </Text>
                    {product.originalPrice > product.price && (
                      <Text className="ml-2 text-xs line-through text-gray-500">
                        {formatPrice(product.originalPrice)}
                      </Text>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mt-1">
                    <Rate disabled defaultValue={product.rating || 5} allowHalf className="text-xs" />
                    <Text className="ml-1 text-xs text-gray-500">
                      ({product.ratingCount || 0})
                    </Text>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Pagination
                current={currentPage}
                total={totalProducts}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                hideOnSinglePage={false}
              />
            </div>
          </>
        ) : (
          <Empty 
            description={
              <span className="text-gray-500 text-lg">
                Không tìm thấy sản phẩm nào phù hợp với "{query}"
              </span>
            }
            className="py-20 bg-white rounded-xl shadow-sm"
          />
        )}
      </div>
    </div>
  );
};

export default SearchResults;