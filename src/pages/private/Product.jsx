import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Input,
  Select,
  Checkbox,
  Slider,
  Card,
  Image,
  Tag,
  Pagination,
  Spin,
  Empty,
  Rate,
  Divider,
  Collapse,
  Tooltip,
} from "antd";
import {
  FilterOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  EyeOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../services/apiClient";

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { Meta } = Card;

const Product = () => {
  const CategoryTree = ({
    categories,
    level = 0,
    parentId = null,
    categoryFilters,
    handleCategoryChange,
  }) => {
    // Lọc danh mục theo parentId
    const filteredCategories = categories.filter(
      (cat) => cat.parentId === parentId
    );

    if (filteredCategories.length === 0) return null;

    return (
      <div className={level > 0 ? "ml-6 mt-2 space-y-2" : ""}>
        {filteredCategories.map((category) => (
          <div key={category.id} className={level === 0 ? "mb-4" : "mb-2"}>
            <Checkbox
              checked={categoryFilters.includes(category.id)}
              onChange={(e) =>
                handleCategoryChange(category.id, e.target.checked)
              }
              className={
                level === 0
                  ? "text-base font-semibold text-gray-800"
                  : "text-sm text-gray-600"
              }
            >
              {category.name}
            </Checkbox>

            {/* Đệ quy hiển thị danh mục con */}
            <CategoryTree
              categories={categories}
              level={level + 1}
              parentId={category.id}
              categoryFilters={categoryFilters}
              handleCategoryChange={handleCategoryChange}
            />
          </div>
        ))}
      </div>
    );
  };

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [categories, setCategories] = useState([]);
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);

  const [ratingFilter, setRatingFilter] = useState(null);
  const [otherFilters, setOtherFilters] = useState({
    isNew: false,
    isBestseller: false,
    isFeatured: false,
  });
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Xây dựng query parameters
      const params = new URLSearchParams();

      // Thêm page và size
      params.append("page", currentPage);
      params.append("size", pageSize);

      // Xây dựng tham số sort
      let sortParam = "";
      switch (sortBy) {
        case "newest":
          sortParam = "createdAt:desc";
          break;
        case "bestselling":
          sortParam = "soldItems:desc";
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
          sortParam = "createdAt:desc";
      }
      params.append("sort", sortParam);

      // Xây dựng filter payload
      const filterPayload = {
        categoryIds: categoryFilters,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        rating: ratingFilter > 0 ? ratingFilter : null,
        isNew: otherFilters.isNew || null,
        isBestseller: otherFilters.isBestseller || null,
        isFeatured: otherFilters.isFeatured || null,
      };

      // Gọi API filter
      const response = await apiClient.post(
        `/api/products/filtered-products?${params.toString()}`,
        filterPayload
      );

      if (response.data && response.data.data) {
        setProducts(response.data.data.products || []);
        setTotalProducts(response.data.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await apiClient.get("/api/categories/all");
        setCategories(categoriesResponse.data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
    fetchProducts();
  }, [
    currentPage,
    pageSize,
    sortBy,
    priceRange,
    categoryFilters,
    ratingFilter,
    otherFilters.isNew,
    otherFilters.isBestseller,
    otherFilters.isFeatured,
  ]);

  useEffect(() => {
    // Reset urlParamsProcessed khi URL thay đổi để có thể xử lý category mới
    setUrlParamsProcessed(false);

    // Log để debug
    console.log("URL đã thay đổi, reset urlParamsProcessed");
  }, [location.search]);

  useEffect(() => {
    // Chỉ xử lý khi categories đã được tải và chưa xử lý URL params
    if (categories.length > 0 && !urlParamsProcessed) {
      const categorySlug = queryParams.get("category");
      const isBestseller = queryParams.get("isBestseller") === "true";
      const isNew = queryParams.get("isNew") === "true";
      const isFeatured = queryParams.get("isFeatured") === "true";

      // Cập nhật các bộ lọc khác từ URL params
      setOtherFilters({
        isBestseller: isBestseller || false,
        isNew: isNew || false,
        isFeatured: isFeatured || false,
      });
      

      if (categorySlug) {
        // Tìm category với slug tương ứng
        const category = categories.find((cat) => cat.slug === categorySlug);

        if (category) {
          
          /// Tìm các danh mục con của category này
          const childCategories = categories
            .filter((cat) => cat.parentId === category.id)
            .map((cat) => cat.id);
          // Thêm tất cả danh mục con vào categoryFilters

          setCategoryFilters((prev) => {
            /// Thêm cateogory con vào categoryFilters nếu chưa có
            const newFilters = [...prev];
            if (!newFilters.includes(category.id)) {
              newFilters.push(category.id);
            }
            childCategories.forEach((childId) => {
              if (!newFilters.includes(childId)) {
                newFilters.push(childId);
              }
            });
            return newFilters;
          });
        } else {
          console.log("Không tìm thấy category với slug:", categorySlug);
        }
      }

      // Đánh dấu đã xử lý URL params
      setUrlParamsProcessed(true);
    }
  }, [categories, queryParams, urlParamsProcessed]);

  const handleRatingChange = (rating, checked) => {
    setRatingFilter(checked ? rating : 0);
    setCurrentPage(1);
  };

  const handleOtherFilterChange = (filterType, checked) => {
    setOtherFilters((prev) => ({
      ...prev,
      [filterType]: checked,
    }));
    setCurrentPage(1);
  };

  const appliedFiltersCount = () => {
    let count = 0;
    if (categoryFilters.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 5000000) count++;
    if (ratingFilter > 0) count++;
    if (otherFilters.isNew) count++;
    if (otherFilters.isBestseller) count++;
    if (otherFilters.isFeatured) count++;
    return count;
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Handle pagination change
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      /// Kiểm tra xem catogory này có phải là danh mục cha hay không.
      const isParent = categories.some(
        (cat) => cat.id === category && cat.parentId === null
      );

      if (isParent) {
        // Nếu là danh mục cha, thêm tất cả danh mục con vào
        const childCategories = categories
          .filter((cat) => cat.parentId === category)
          .map((cat) => cat.id);
        childCategories.forEach((childId) => {
          if (!newCategories.includes(childId)) {
            newCategories.push(childId);
          }
          if (!newCategories.includes(category)) {
            newCategories.push(category);
          }
        });
      } else {
        // Nếu là danh mục con, chỉ thêm danh mục đó
        if (!newCategories.includes(category)) {
          newCategories.push(category);
        }
      }
    } else {
      /// Kiểm tra xem category có phải là danh mục cha hay không.
      const isParent = categories.some(
        (cat) => cat.id === category && cat.parentId === null
      );
      if (isParent) {
        // Nếu là danh mục cha, xóa tất cả danh mục con khỏi bộ lọc
        const childCategories = categories
          .filter((cat) => cat.parentId === category)
          .map((cat) => cat.id);
        childCategories.forEach((childId) => {
          const index = newCategories.indexOf(childId);
          if (index > -1) {
            newCategories.splice(index, 1);
          }
        });
      }
      const index = newCategories.indexOf(category);
      if (index > -1) {
        newCategories.splice(index, 1);
      }
    }
    setCategoryFilters(newCategories);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setCategoryFilters([]);
    setPriceRange([0, 5000000]);
    setRatingFilter(0);
    setOtherFilters({
      isNew: false,
      isBestseller: false,
      isFeatured: false,
    });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-display">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Title level={2} className="font-bold">
            Sản phẩm
          </Title>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <div
            className={`md:w-1/4 lg:w-1/5 ${
              showFilters ? "block" : "hidden md:block"
            }`}
          >
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="m-0">
                  Bộ lọc
                </Title>
                {appliedFiltersCount() > 0 && (
                  <Button
                    type="link"
                    onClick={clearAllFilters}
                    className="p-0 text-indigo-600"
                  >
                    Xóa tất cả
                  </Button>
                )}
              </div>

              <Divider className="my-3" />

              {/* Categories Filter */}
              <Collapse
                defaultActiveKey={["categories"]}
                ghost
                expandIconPosition="end"
                className="filter-collapse"
              >
                <Panel
                  header={
                    <Title level={5} className="m-0">
                      Danh mục
                    </Title>
                  }
                  key="categories"
                >
                  {/* Sử dụng component đệ quy để hiển thị danh mục */}
                  <CategoryTree
                    categories={categories.flat()}
                    categoryFilters={categoryFilters}
                    handleCategoryChange={handleCategoryChange}
                  />
                </Panel>
              </Collapse>

              <Divider className="my-3" />

              {/* Price Filter */}
              <Collapse
                defaultActiveKey={["price"]}
                ghost
                expandIconPosition="end"
                className="filter-collapse"
              >
                <Panel
                  header={
                    <Title level={5} className="m-0">
                      Giá
                    </Title>
                  }
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
                        formatter: (value) => formatPrice(value),
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
                  header={
                    <Title level={5} className="m-0">
                      Đánh giá
                    </Title>
                  }
                  key="rating"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center mb-2">
                      <Checkbox
                        className="mr-2"
                        checked={ratingFilter === rating}
                        onChange={(e) =>
                          handleRatingChange(rating, e.target.checked)
                        }
                      />
                      <Rate
                        disabled
                        defaultValue={rating}
                        className="text-sm"
                      />
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
                  header={
                    <Title level={5} className="m-0">
                      Khác
                    </Title>
                  }
                  key="other"
                >
                  <div className="space-y-2">
                    <Checkbox
                      checked={otherFilters.isNew}
                      onChange={(e) =>
                        handleOtherFilterChange("isNew", e.target.checked)
                      }
                    >
                      Sản phẩm mới
                    </Checkbox>
                  </div>

                  <div className="mt-3">
                    <Checkbox
                      checked={otherFilters.isBestseller}
                      onChange={(e) =>
                        handleOtherFilterChange(
                          "isBestseller",
                          e.target.checked
                        )
                      }
                    >
                      Bán chạy nhất
                    </Checkbox>
                  </div>

                  <div className="mt-3">
                    <Checkbox
                      checked={otherFilters.isFeatured}
                      onChange={(e) =>
                        handleOtherFilterChange("isFeatured", e.target.checked)
                      }
                    >
                      Sản phẩm nổi bật
                    </Checkbox>
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
                {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"} (
                {appliedFiltersCount()} bộ lọc đang áp dụng)
              </Button>
            </div>

            {/* Sort and Results Count */}
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
                {categoryFilters.map((catId) => {
                  const selectedCategory = categories.find(
                    (cat) => cat.id === catId
                  );
                  return (
                    <Tag
                      key={catId}
                      closable
                      onClose={() => handleCategoryChange(catId, false)}
                      className="py-1 px-3 text-sm bg-indigo-50 text-indigo-800 border-indigo-200"
                    >
                      {selectedCategory ? selectedCategory.name : "Danh mục"}
                    </Tag>
                  );
                })}

                {(priceRange[0] > 0 || priceRange[1] < 5000000) && (
                  <Tag
                    closable
                    onClose={() => setPriceRange([0, 5000000])}
                    className="py-1 px-3 text-sm bg-indigo-50 text-indigo-800 border-indigo-200"
                  >
                    Giá: {formatPrice(priceRange[0])} -{" "}
                    {formatPrice(priceRange[1])}
                  </Tag>
                )}

                {ratingFilter > 0 && (
                  <Tag
                    closable
                    onClose={() => setRatingFilter(0)}
                    className="py-1 px-3 text-sm bg-indigo-50 text-indigo-800 border-indigo-200"
                  >
                    Đánh giá: từ {ratingFilter} sao
                  </Tag>
                )}

                {otherFilters.isNew && (
                  <Tag
                    closable
                    onClose={() => handleOtherFilterChange("isNew", false)}
                    className="py-1 px-3 text-sm bg-indigo-50 text-indigo-800 border-indigo-200"
                  >
                    Sản phẩm mới
                  </Tag>
                )}

                {otherFilters.isBestseller && (
                  <Tag
                    closable
                    onClose={() =>
                      handleOtherFilterChange("isBestseller", false)
                    }
                    className="py-1 px-3 text-sm bg-indigo-50 text-indigo-800 border-indigo-200"
                  >
                    Bán chạy nhất
                  </Tag>
                )}

                {otherFilters.isFeatured && (
                  <Tag
                    closable
                    onClose={() => handleOtherFilterChange("isFeatured", false)}
                    className="py-1 px-3 text-sm bg-indigo-50 text-indigo-800 border-indigo-200"
                  >
                    Sản phẩm nổi bật
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
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="group overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300"
                    bodyStyle={{ padding: "12px 16px" }}
                    cover={
                      <div className="relative pt-[125%] overflow-hidden bg-gray-100">
                        <Link to={`/products/${product.slug}`}>
                          {/* Sử dụng img thông thường thay vì Ant Design Image */}
                          <img
                            src={product.cover}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                              console.error("Image failed to load:", e);
                              e.target.src =
                                "https://placehold.co/300x400/e2e8f0/64748b?text=Không+có+ảnh";
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
                              -
                              {Math.round(
                                (1 - product.price / product.originalPrice) *
                                  100
                              )}
                              %
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
                    {product.productVariants &&
                      product.productVariants.length > 0 && (
                        <div className="flex gap-1 mb-2 mt-1">
                          {Array.from(
                            new Set(
                              product.productVariants.map((v) => v.colorHex)
                            )
                          )
                            .slice(0, 4)
                            .map((color, index) => (
                              <Tooltip
                                key={index}
                                title={
                                  product.productVariants.find(
                                    (v) => v.colorHex === color
                                  )?.colorName || "Màu sắc"
                                }
                              >
                                <div
                                  className="w-5 h-5 rounded-full cursor-pointer border border-gray-300 shadow-sm"
                                  style={{ backgroundColor: color }}
                                />
                              </Tooltip>
                            ))}
                          {Array.from(
                            new Set(
                              product.productVariants.map((v) => v.colorHex)
                            )
                          ).length > 4 && (
                            <Tooltip title="Thêm màu sắc khác">
                              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 border border-gray-300">
                                +
                                {Array.from(
                                  new Set(
                                    product.productVariants.map(
                                      (v) => v.colorHex
                                    )
                                  )
                                ).length - 4}
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
                    {product.productVariants &&
                      product.productVariants.length > 0 && (
                        <div className="flex gap-1 my-1">
                          {Array.from(
                            new Set(product.productVariants.map((v) => v.size))
                          )
                            .slice(0, 3)
                            .map((size, index) => (
                              <Tag
                                key={index}
                                className="m-0 text-xs border-gray-200 text-gray-600 bg-gray-50"
                              >
                                {size}
                              </Tag>
                            ))}
                          {Array.from(
                            new Set(product.productVariants.map((v) => v.size))
                          ).length > 3 && (
                            <Tag className="m-0 text-xs border-gray-200 text-gray-600 bg-gray-50">
                              +
                              {Array.from(
                                new Set(
                                  product.productVariants.map((v) => v.size)
                                )
                              ).length - 3}
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

                    {/* Stock Indicator/Rating */}
                    <div className="flex flex-col items-start justify-start mt-1">
                      {product.productVariants &&
                      product.productVariants.length > 0 ? (
                        <Text className="text-xs text-gray-500">
                          {product.productVariants.reduce(
                            (sum, variant) => sum + variant.quantity,
                            0
                          )}{" "}
                          sản phẩm có sẵn
                        </Text>
                      ) : (
                        <span></span>
                      )}
                      <div className="flex items-center">
                        <Rate
                          disabled
                          defaultValue={product.rating || 5.0}
                          allowHalf
                          className="text-xs"
                        />
                        <Text className="ml-1 text-xs text-gray-500">(46)</Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination - Keep existing pagination code */}
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
