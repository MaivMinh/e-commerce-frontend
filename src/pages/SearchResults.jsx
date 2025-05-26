import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Pagination, Spin, Empty, Typography, Select } from "antd";
import { ShoppingCartOutlined, EyeOutlined, HeartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Meta } = Card;
const { Option } = Select;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("relevance");
  const pageSize = 12;

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
        // In a real application, call your API here
        // const response = await apiClient.get(`/api/products/search?q=${query}&page=${currentPage}&limit=${pageSize}&sort=${sortBy}`);
        // setProducts(response.data.products);
        // setTotalProducts(response.data.total);
        
        // Simulated data for now
        setTimeout(() => {
          const mockProducts = Array(8).fill().map((_, index) => ({
            id: index + 1,
            name: `Kết quả cho "${query}" #${index + 1}`,
            price: Math.floor(Math.random() * 50 + 10) * 10000,
            image: `https://picsum.photos/400/400?random=${index}`,
            discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30 + 10) : 0
          }));
          
          setProducts(mockProducts);
          setTotalProducts(24);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage, sortBy]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Title level={2}>Kết quả tìm kiếm cho "{query}"</Title>
        <Text className="text-gray-600">Tìm thấy {totalProducts} sản phẩm</Text>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <Text className="text-gray-600">Hiển thị {Math.min(currentPage * pageSize, totalProducts)} / {totalProducts} sản phẩm</Text>
            <Select 
              defaultValue="relevance" 
              style={{ width: 200 }} 
              onChange={value => setSortBy(value)}
              className="font-display"
            >
              <Option value="relevance">Mức độ liên quan</Option>
              <Option value="price_asc">Giá: Thấp đến cao</Option>
              <Option value="price_desc">Giá: Cao đến thấp</Option>
              <Option value="newest">Mới nhất</Option>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                hoverable
                cover={
                  <div className="relative pt-[100%] overflow-hidden">
                    <img
                      alt={product.name}
                      src={product.image}
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
                bodyStyle={{ padding: '16px' }}
              >
                <Meta
                  title={<a href={`/product/${product.id}`} className="text-gray-800 hover:text-indigo-600">{product.name}</a>}
                  description={
                    <div className="mt-2">
                      {product.discount > 0 ? (
                        <div>
                          <Text delete className="text-gray-500 mr-2">
                            {formatPrice(product.price)}
                          </Text>
                          <Text className="text-red-500 font-semibold">
                            {formatPrice(product.price * (1 - product.discount / 100))}
                          </Text>
                        </div>
                      ) : (
                        <Text className="text-gray-800 font-semibold">{formatPrice(product.price)}</Text>
                      )}
                    </div>
                  }
                />
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Pagination
              current={currentPage}
              total={totalProducts}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
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
          className="py-20"
        />
      )}
    </div>
  );
};

export default SearchResults;