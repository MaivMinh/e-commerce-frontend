import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Input, Select, Checkbox, Slider, Card, 
  Image, Tag, Pagination, Spin, Empty, Rate, Divider, Collapse
} from 'antd';
import {
  FilterOutlined, ShoppingCartOutlined, HeartOutlined, 
  EyeOutlined,
  FireOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { Meta } = Card;

const Product = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  
  // Fetch products
  useEffect(() => {
    // In a real app, you would fetch from API with query params
    // const params = {
    //   page: currentPage,
    //   limit: pageSize,
    //   sort: sortBy,
    //   minPrice: priceRange[0],
    //   maxPrice: priceRange[1],
    //   categories: categoryFilters.join(',')
    // };
    // apiClient.get('/api/products', { params })
    
    setLoading(true);
    
    // Mock data
    setTimeout(() => {
      const mockProducts = Array(24).fill().map((_, index) => ({
        id: `product-${index + 1}`,
        name: `Sản phẩm thời trang #${index + 1}`,
        image: `https://picsum.photos/400/500?random=${index}`,
        price: Math.floor(Math.random() * 1000000) + 100000,
        originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 1500000) + 200000 : null,
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 200),
        isNew: index < 5,
        isBestseller: index % 7 === 0,
        category: index % 3 === 0 ? 'men' : index % 3 === 1 ? 'women' : 'accessories'
      }));
      
      setProducts(mockProducts);
      setTotalProducts(96);
      setLoading(false);
    }, 1000);
  }, [currentPage, pageSize, sortBy, priceRange, categoryFilters]);
  
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  // Handle pagination change
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };
  
  // Handle price range change
  const handlePriceChange = (value) => {
    setPriceRange(value);
  };
  
  // Handle price range after change complete
  const handlePriceAfterChange = (value) => {
    setCurrentPage(1);
  };
  
  // Handle category filter change
  const handleCategoryChange = (category, checked) => {
    const newCategories = [...categoryFilters];
    
    if (checked) {
      newCategories.push(category);
    } else {
      const index = newCategories.indexOf(category);
      if (index > -1) {
        newCategories.splice(index, 1);
      }
    }
    
    setCategoryFilters(newCategories);
    setCurrentPage(1);
  };
  
  // Mock categories data
  const categories = [
    {
      name: 'Thời trang nam',
      key: 'men',
      subcategories: [
        { name: 'Áo thun', key: 'men_tshirts' },
        { name: 'Áo sơ mi', key: 'men_shirts' },
        { name: 'Quần jean', key: 'men_jeans' },
        { name: 'Quần kaki', key: 'men_khakis' },
        { name: 'Áo khoác', key: 'men_jackets' }
      ]
    },
    {
      name: 'Thời trang nữ',
      key: 'women',
      subcategories: [
        { name: 'Áo thun', key: 'women_tshirts' },
        { name: 'Áo sơ mi', key: 'women_shirts' },
        { name: 'Váy', key: 'women_dresses' },
        { name: 'Quần jean', key: 'women_jeans' },
        { name: 'Áo khoác', key: 'women_jackets' }
      ]
    },
    {
      name: 'Phụ kiện',
      key: 'accessories',
      subcategories: [
        { name: 'Túi xách', key: 'bags' },
        { name: 'Giày', key: 'shoes' },
        { name: 'Đồng hồ', key: 'watches' },
        { name: 'Mắt kính', key: 'glasses' },
        { name: 'Thắt lưng', key: 'belts' }
      ]
    }
  ];
  
  // Clear all filters
  const clearAllFilters = () => {
    setCategoryFilters([]);
    setPriceRange([0, 5000000]);
    setCurrentPage(1);
  };
  
  // Calculate applied filters count
  const appliedFiltersCount = () => {
    let count = 0;
    if (categoryFilters.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 5000000) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-display">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Title level={2} className="font-bold">Sản phẩm</Title>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <div className={`md:w-1/4 lg:w-1/5 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="m-0">Bộ lọc</Title>
                {appliedFiltersCount() > 0 && (
                  <Button type="link" onClick={clearAllFilters} className="p-0 text-indigo-600">
                    Xóa tất cả
                  </Button>
                )}
              </div>
              
              <Divider className="my-3" />
              
              {/* Categories Filter */}
              <Collapse 
                defaultActiveKey={['categories']} 
                ghost 
                expandIconPosition="end"
                className="filter-collapse"
              >
                <Panel 
                  header={<Title level={5} className="m-0">Danh mục</Title>} 
                  key="categories"
                >
                  {categories.map(category => (
                    <div key={category.key} className="mb-4">
                      <Checkbox
                        checked={categoryFilters.includes(category.key)}
                        onChange={(e) => handleCategoryChange(category.key, e.target.checked)}
                        className="text-base font-medium text-gray-700"
                      >
                        {category.name}
                      </Checkbox>
                      
                      {category.subcategories.map(subcat => (
                        <div key={subcat.key} className="ml-6 mt-2">
                          <Checkbox
                            checked={categoryFilters.includes(subcat.key)}
                            onChange={(e) => handleCategoryChange(subcat.key, e.target.checked)}
                            className="text-gray-600"
                          >
                            {subcat.name}
                          </Checkbox>
                        </div>
                      ))}
                    </div>
                  ))}
                </Panel>
              </Collapse>
              
              <Divider className="my-3" />
              
              {/* Price Filter */}
              <Collapse 
                defaultActiveKey={['price']} 
                ghost 
                expandIconPosition="end"
                className="filter-collapse"
              >
                <Panel 
                  header={<Title level={5} className="m-0">Giá</Title>} 
                  key="price"
                >
                  <div className="px-2">
                    <Slider
                      range
                      min={0}
                      max={5000000}
                      step={100000}
                      value={priceRange}
                      onChange={handlePriceChange}
                      onAfterChange={handlePriceAfterChange}
                      tooltip={{
                        formatter: value => formatPrice(value)
                      }}
                      className="mt-6"
                    />
                    
                    <div className="flex justify-between mt-2">
                      <Text>{formatPrice(priceRange[0])}</Text>
                      <Text>{formatPrice(priceRange[1])}</Text>
                    </div>
                  </div>
                </Panel>
              </Collapse>
              
              <Divider className="my-3" />
              
              {/* Rating Filter */}
              <Collapse 
                defaultActiveKey={[]} 
                ghost 
                expandIconPosition="end"
                className="filter-collapse"
              >
                <Panel 
                  header={<Title level={5} className="m-0">Đánh giá</Title>} 
                  key="rating"
                >
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center mb-2">
                      <Checkbox className="mr-2" />
                      <Rate disabled defaultValue={rating} className="text-sm" />
                      <Text className="ml-1">từ {rating} sao</Text>
                    </div>
                  ))}
                </Panel>
              </Collapse>
              
              <Divider className="my-3" />
              
              {/* Other Filters */}
              <Collapse 
                defaultActiveKey={[]} 
                ghost 
                expandIconPosition="end"
                className="filter-collapse"
              >
                <Panel 
                  header={<Title level={5} className="m-0">Khác</Title>} 
                  key="other"
                >
                  <div className="space-y-2">
                    <Checkbox>Đang giảm giá</Checkbox>
                    <div className="ml-6 mt-2">
                      <Checkbox>Giảm giá ít nhất 10%</Checkbox>
                    </div>
                    <div className="ml-6 mt-2">
                      <Checkbox>Giảm giá ít nhất 20%</Checkbox>
                    </div>
                    <div className="ml-6 mt-2">
                      <Checkbox>Giảm giá ít nhất 30%</Checkbox>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Checkbox>Sản phẩm mới</Checkbox>
                  </div>
                  
                  <div className="mt-3">
                    <Checkbox>Bán chạy nhất</Checkbox>
                  </div>
                </Panel>
              </Collapse>
            </div>
          </div>
          
          {/* Right Content - Products */}
          <div className="md:w-3/4 lg:w-4/5">
            {/* Mobile Filter Button */}
            <div className="md:hidden mb-4">
              <Button 
                icon={<FilterOutlined />} 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'} ({appliedFiltersCount()} bộ lọc đang áp dụng)
              </Button>
            </div>
            
            {/* Sort and Results Count */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <Text className="text-gray-600 mb-3 sm:mb-0">
                  Hiển thị {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalProducts)} trên {totalProducts} sản phẩm
                </Text>
                
                <div className="flex items-center">
                  <Text className="mr-2 text-gray-600 whitespace-nowrap">Sắp xếp theo:</Text>
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-40"
                    size="middle"
                  >
                    <Option value="newest">Mới nhất</Option>
                    <Option value="bestselling">Bán chạy nhất</Option>
                    <Option value="price_asc">Giá thấp đến cao</Option>
                    <Option value="price_desc">Giá cao đến thấp</Option>
                    <Option value="rating">Đánh giá cao nhất</Option>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Applied Filters */}
            {appliedFiltersCount() > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {categoryFilters.map((cat) => {
                  const category = categories.find(c => c.key === cat) || 
                                 categories.flatMap(c => c.subcategories).find(s => s.key === cat);
                  return (
                    <Tag 
                      key={cat} 
                      closable 
                      onClose={() => handleCategoryChange(cat, false)}
                      className="py-1 px-3 text-sm bg-indigo-50 text-indigo-800 border-indigo-200"
                    >
                      {category ? category.name : cat}
                    </Tag>
                  );
                })}
                
                {(priceRange[0] > 0 || priceRange[1] < 5000000) && (
                  <Tag 
                    closable 
                    onClose={() => setPriceRange([0, 5000000])}
                    className="py-1 px-3 text-sm bg-indigo-50 text-indigo-800 border-indigo-200"
                  >
                    Giá: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </Tag>
                )}
              </div>
            )}
            
            {/* Products Grid */}
            {loading ? (
              <div className="bg-white rounded-xl p-10 flex justify-center">
                <Spin size="large" />
              </div>
            ) : products.length === 0 ? (
              <Empty
                description="Không tìm thấy sản phẩm nào phù hợp với bộ lọc đã chọn"
                className="bg-white rounded-xl p-10"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="product-card rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-gray-200"
                    cover={
                      <div className="relative pt-[130%] overflow-hidden bg-gray-100">
                        <Link to={`/product/${product.id}`}>
                          <Image
                            src={product.image}
                            alt={product.name}
                            preview={false}
                            className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        </Link>
                        {product.isNew && (
                          <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded">
                            Mới
                          </div>
                        )}
                        {product.isBestseller && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded flex items-center">
                            <FireOutlined className="mr-1" /> Bán chạy
                          </div>
                        )}
                        {product.originalPrice && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            shape="circle"
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="bg-white text-gray-800 border-0 hover:bg-indigo-600 hover:text-white"
                          />
                          <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            shape="circle"
                            className="bg-white text-gray-800 border-0 hover:bg-indigo-600 hover:text-white"
                          />
                          <Button
                            type="primary"
                            icon={<HeartOutlined />}
                            shape="circle"
                            className="bg-white text-gray-800 border-0 hover:bg-indigo-600 hover:text-white"
                          />
                        </div>
                      </div>
                    }
                    bodyStyle={{ padding: '12px 16px' }}
                  >
                    <Link to={`/product/${product.id}`} className="block mb-1">
                      <Text ellipsis={{ tooltip: product.name }} className="text-gray-800 hover:text-indigo-600 transition font-medium">
                        {product.name}
                      </Text>
                    </Link>
                    
                    <div className="flex items-center mb-1">
                      <Rate disabled defaultValue={parseFloat(product.rating)} allowHalf className="text-xs" />
                      <Text className="ml-1 text-gray-500 text-sm">({product.reviews})</Text>
                    </div>
                    
                    <div className="flex items-center">
                      <Text className="text-lg font-semibold text-indigo-600">
                        {formatPrice(product.price)}
                      </Text>
                      {product.originalPrice && (
                        <Text className="ml-2 text-sm line-through text-gray-500">
                          {formatPrice(product.originalPrice)}
                        </Text>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Pagination */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;