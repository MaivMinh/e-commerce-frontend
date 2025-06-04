import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Spin,
  Typography,
  Radio,
  Button,
  Divider,
  Image,
  Rate,
  Tag,
  Breadcrumb,
  notification,
  InputNumber,
  Space,
  List,
  Avatar,
  Tabs,
  Form,
  Input,
  Progress,
  Empty,
  Dropdown,
  Menu,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ShareAltOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomOutOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  UndoOutlined,
  LeftOutlined,
  RightOutlined,
  SwapOutlined,
  IssuesCloseOutlined,
  UserOutlined,
  StarFilled,
  StarOutlined,
  FilterOutlined,
  LikeOutlined,
  DislikeOutlined,
  CommentOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import apiClient from "../../services/apiClient";
import { AuthContext } from "../../context/AuthContext";
import { color } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
  const params = useParams();
  const slug = params.slug;
  const navigate = useNavigate();
  const {auth} = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isAddToCartProcessing, setIsAddToCartProcessing] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    average: 4.3,
    total: 87,
    distribution: [5, 27, 38, 12, 5],
  });

  const [reviewPage, setReviewPage] = useState(1);
  const [reviewFilter, setReviewFilter] = useState("all");

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [variants, setVariants] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState({});
  const [pricing, setPricing] = useState({});
  const [currentQuantity, setCurrentQuantity] = useState(null);
  const [current, setCurrent] = React.useState(0);
  const [api, contextHolder] = notification.useNotification();

  const [isAddToCart, setIsAddToCart] = useState(false);

  ///Hàm fetch review giả lập
  useEffect(() => {
    // Trong thực tế, gọi API ở đây: apiClient.get(`/api/products/${productId}/reviews?page=${reviewPage}&filter=${reviewFilter}`)

    // Dữ liệu mẫu
    const mockReviews = [
      {
        id: 1,
        author: "Nguyễn Văn A",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        content:
          "Sản phẩm rất tốt, vải đẹp và thoáng mát. Tôi rất hài lòng với chất lượng và sẽ mua thêm các sản phẩm khác.",
        rating: 5,
        date: "2025-02-15T08:24:00",
        likes: 12,
        images: [
          "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
        ],
      },
      {
        id: 2,
        author: "Trần Thị B",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        content:
          "Size hơi nhỏ so với mô tả, nhưng chất lượng khá ổn. Màu sắc đúng như hình.",
        rating: 4,
        date: "2025-02-10T14:32:00",
        likes: 5,
        images: [],
      },
      {
        id: 3,
        author: "Lê Văn C",
        avatar: "https://randomuser.me/api/portraits/men/67.jpg",
        content:
          "Giao hàng nhanh, đóng gói cẩn thận. Tuy nhiên áo hơi nhăn, cần ủi trước khi mặc.",
        rating: 4,
        date: "2025-01-28T19:15:00",
        likes: 2,
        images: [
          "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
          "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
        ],
      },
      {
        id: 4,
        author: "Phạm Thị D",
        avatar: "https://randomuser.me/api/portraits/women/25.jpg",
        content:
          "Tôi rất thất vọng với sản phẩm này. Màu sắc không đúng như mô tả và size thì quá nhỏ so với bảng size đã cung cấp.",
        rating: 2,
        date: "2025-01-15T09:42:00",
        likes: 8,
        images: [],
      },
      {
        id: 5,
        author: "Hoàng Văn E",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        content: "Áo đẹp, form chuẩn, đường may tỉ mỉ. Sẽ ủng hộ shop dài dài.",
        rating: 5,
        date: "2025-01-05T16:30:00",
        likes: 15,
        images: [
          "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
        ],
      },
    ];

    setReviews(mockReviews);
  }, [reviewPage, reviewFilter, slug]);

  // Format thời gian
  const formatReviewDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render rating stars
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-lg">
            {star <= rating ? (
              <StarFilled className="text-yellow-400" />
            ) : (
              <StarOutlined className="text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  const openSuccessNofitication = (message, description) => {
    api.open({
      message: <span className="text-green-500">{message}</span>,
      type: "success",
      description: <span className="font-semibold">{description}</span>,
      icon: <CheckCircleOutlined style={{ color: "green" }} />,
      placement: "topRight",
      pauseOnHover: true,
      showProgress: true,
      duration: 3,
      style: {
        width: 400,
        borderRadius: "8px",
        backgroundColor: "#f0fff4", // Light green background
        color: "#065f46", // Dark green text
        border: "1px solid #bbf7d0", // Light green border
        boxShadow: "0 2px 10px rgba(16, 185, 129, 0.2)", // Subtle shadow
        fontFamily: "Arial, sans-serif", // Custom font
      },
    });
  };

  const openErrorNotification = (message) => {
    api.open({
      message: <span className="text-red-500">Thông báo</span>,
      type: "error",
      description: <span className="font-semibold">{message}</span>,
      icon: <IssuesCloseOutlined style={{ color: "red" }} />,
      placement: "topRight",
      pauseOnHover: true,
      showProgress: true,
      duration: 3,
    });
  };
  const onDownload = () => {
    const url = product.images[current];
    const suffix = url.slice(url.lastIndexOf("."));
    const filename = Date.now() + suffix;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(blobUrl);
        link.remove();
      });
  };

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        // For demo purposes, we'll use the provided data instead of API call
        const response = await apiClient.get(`/api/products/slug?name=${slug}`);
        const product = response.data.data;
        setProduct(product);

        const variantsResponse = await apiClient.get(
          `/api/products/${product.id}/variants`
        );
        const variants = variantsResponse.data.data;
        setVariants(variants);

        const sizes = Array.from(
          new Set(variants.map((variant) => variant.size))
        );
        const colors = {};
        variants.forEach((variant) => {
          if (!colors[variant.size]) {
            colors[variant.size] = [];
          }
          colors[variant.size].push({
            name: variant.colorName,
            hex: variant.colorHex,
          });
        });
        setSizes(sizes);
        setColors(colors);
        setPricing(
          variants.reduce((acc, variant) => {
            if (!acc[variant.size]) {
              acc[variant.size] = {};
            }
            acc[variant.size][variant.colorName] = variant.price;
            return acc;
          }, {})
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Có lỗi xảy ra khi lấy thông tin sản phẩm.");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    document.title = "Chi tiết sản phẩm | E-commerce Shop";
    fetchProductDetail();
  }, [slug]);

  const handleSizeChange = (e) => {
    const size = e.target.value;
    setSelectedSize(size);
    setSelectedColor(null);
    handleQuantityDisplay(null);
  };

  const handleColorChange = (colorName) => {
    console.log(colorName);
    setSelectedColor(colorName);
    handleQuantityDisplay(colorName); // Update quantity display when color changes
  };

  const handleQuantityDisplay = (colorName) => {
    ///Lấy số lượng hiện tại của sản phẩm. Ứng với size và color đã chọn
    if (selectedSize && colorName) {
      console.log(selectedSize, selectedColor);
      const variant = variants.find(
        (v) => v.size === selectedSize && v.colorName === colorName
      );
      setCurrentQuantity(variant ? variant.quantity : 0);
    } else {
      console.log("Chưa chọn size hoặc color", selectedSize, colorName);
      setCurrentQuantity(0);
    }
  };

  /// Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    setIsAddToCartProcessing(true);
    if (!selectedSize || !selectedColor) {
      openErrorNotification(
        "Vui lòng chọn kích thước và màu sắc trước khi thêm vào giỏ hàng."
      );
      setIsAddToCartProcessing(false);
      return;
    }
    /// Lấy thông tin variant hiện tại dựa trên size và color đã chọn
    const variant = variants.find(
      (v) => v.size === selectedSize && v.colorName === selectedColor
    );
    if (!variant) {
      openErrorNotification(
        "Không tìm thấy sản phẩm với kích thước và màu sắc đã chọn."
      );
      setIsAddToCartProcessing(false);
      return;
    }
    try {
      const data = {
        productVariantDTO: {
          id: variant.id,
        },
        quantity: quantity,
      };
      const response = await apiClient.post(`/api/carts/${auth.accountId}/items`, data);
      openSuccessNofitication(
        "Đã thêm vào giỏ hàng",
        `Đã thêm ${product.name} (${selectedSize}, ${selectedColor}) x${quantity} vào giỏ hàng.`
      );
      setIsAddToCart(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      openErrorNotification("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.");
    } finally {
      setIsAddToCartProcessing(false);
    }
  };

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get current price based on selections
  const getCurrentPrice = () => {
    if (selectedSize && selectedColor) {
      return pricing[selectedSize][selectedColor];
    }
    return product?.price || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Title level={3} className="text-red-500">
            {error}
          </Title>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen font-display">
      {contextHolder}
      <div className="w-[90%] mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined style={{ fontSize: "18px" }} />{" "}
              <span className="text-lg">Trang chủ</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/products" className="text-lg">
              Sản phẩm
            </Breadcrumb.Item>
            <Breadcrumb.Item className="text-lg">Chi tiết</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative rounded-lg overflow-hidden cursor-pointer h-[500px] bg-gray-100 flex items-center justify-center py-5">
                <img
                  src={product.cover}
                  alt={product.name}
                  className="object-cover h-full"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="flex flex-items justify-between items-center mx-[4%] mt-8">
                <Image.PreviewGroup
                  preview={{
                    toolbarRender: (
                      _,
                      {
                        transform: { scale },
                        actions: {
                          onActive,
                          onFlipY,
                          onFlipX,
                          onRotateLeft,
                          onRotateRight,
                          onZoomOut,
                          onZoomIn,
                          onReset,
                        },
                      }
                    ) => (
                      <Space size={12} className="toolbar-wrapper">
                        <LeftOutlined
                          onClick={() =>
                            onActive === null || onActive === void 0
                              ? void 0
                              : onActive(-1)
                          }
                        />
                        <RightOutlined
                          onClick={() =>
                            onActive === null || onActive === void 0
                              ? void 0
                              : onActive(1)
                          }
                        />
                        <DownloadOutlined onClick={onDownload} />
                        <SwapOutlined rotate={90} onClick={onFlipY} />
                        <SwapOutlined onClick={onFlipX} />
                        <RotateLeftOutlined onClick={onRotateLeft} />
                        <RotateRightOutlined onClick={onRotateRight} />
                        <ZoomOutOutlined
                          disabled={scale === 1}
                          onClick={onZoomOut}
                        />
                        <ZoomInOutlined
                          disabled={scale === 50}
                          onClick={onZoomIn}
                        />
                        <UndoOutlined onClick={onReset} />
                      </Space>
                    ),
                    onChange: (index) => {
                      setCurrent(index);
                    },
                  }}
                >
                  {product.images.map((image, index) => (
                    <Image key={index} src={image} width={120} />
                  ))}
                </Image.PreviewGroup>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Product stats */}
              <div>
                <Title level={2} className="font-bold text-gray-800 mb-2">
                  {product.name}
                </Title>
                <div className="flex items-center space-x-4 mb-2">
                  <Rate disabled defaultValue={4.5} allowHalf />
                  <Text className="text-gray-500">(150 đánh giá)</Text>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag color="green" className="flex items-center">
                    <CheckOutlined className="mr-1" /> Còn hàng
                  </Tag>
                  <Text className="text-gray-500">Đã bán: 250+</Text>
                </div>
              </div>

              <Divider className="my-4" />
              <div className="grid grid-cols-10">
                <div className="col-span-6">
                  {/* Product details */}
                  <div class>
                    <p className="mb-1 font-semibold">Giá bán:</p>
                    <Title level={2} italic>
                      {formatPrice(getCurrentPrice())}
                    </Title>
                    {selectedSize && selectedColor && (
                      <Title level={4} type="danger">
                        Size: {selectedSize}, Màu: {selectedColor}
                      </Title>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <Title level={5} className="font-semibold">
                      Mô tả:
                    </Title>
                    <Paragraph strong className="text-gray-600">
                      {product.description}
                    </Paragraph>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="col-span-4 flex flex-col justify-start items-start gap-4">
                  {isAddToCart ? (
                    <Button
                      color="purple"
                      size="large"
                      variant="solid"
                      icon={<CheckCircleOutlined />}
                      className="h-12 border-0"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onClick={() => navigate("/cart")}
                    >
                      Đi tới giỏ hàng
                    </Button>
                  ) : (
                    <Button
                      color="default"
                      size="large"
                      variant="solid"
                      icon={<ShoppingCartOutlined />}
                      className="h-12 border-0"
                      loading={isAddToCartProcessing}
                      onClick={handleAddToCart}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      Thêm vào giỏ hàng
                    </Button>
                  )}
                  <div className="flex flex-row justify-start items-center gap-5">
                    <Button
                      size="large"
                      style={{ backgroundColor: "#fff" }}
                      icon={<HeartOutlined />}
                      className="min-w-[50px] h-12 text-red-500 border-red-200 hover:border-red-500"
                    >
                      Yêu thích
                    </Button>
                    <Button
                      size="large"
                      icon={<ShareAltOutlined />}
                      className="min-w-[50px] h-12"
                    >
                      Chia sẻ
                    </Button>
                  </div>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Size Selection */}
              <div>
                <Title level={5} className="font-semibold mb-3">
                  Kích thước
                </Title>
                <Radio.Group
                  onChange={handleSizeChange}
                  value={selectedSize}
                  className="flex flex-wrap gap-2"
                >
                  {sizes.map((size) => (
                    <Radio.Button
                      key={size}
                      value={size}
                      className={`min-w-[60px] text-center ${
                        selectedSize === size
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : ""
                      }`}
                    >
                      {size}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>

              {/* Color Selection - Only show if size is selected */}
              {selectedSize && (
                <div>
                  <Title level={5} className="font-semibold mb-3">
                    Màu sắc
                  </Title>
                  <div className="flex flex-wrap gap-4 items-center">
                    {colors[selectedSize].map((color) => (
                      <div
                        key={color.name}
                        onClick={() => handleColorChange(color.name)}
                        className={`
                          relative w-12 h-12 rounded-full cursor-pointer 
                          flex items-center justify-center 
                          ${
                            selectedColor === color.name
                              ? "ring-[1px] ring-offset-[0px] ring-red-700"
                              : ""
                          }
                          transition-all duration-200
                        `}
                        title={color.name + "alsdflads"}
                      >
                        <div
                          className={`
                            w-10 h-10 rounded-full 
                            ${
                              color.hex === "#FFFFFF"
                                ? "border border-gray-300"
                                : ""
                            }
                          `}
                          style={{ backgroundColor: color.hex }}
                        >
                          {selectedColor === color.name && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full shadow-md"></div>
                            </div>
                          )}
                        </div>
                        <div className="absolute mt-20 text-xs text-nowrap text-gray-600">
                          {color.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-10">
                <Title level={5} className="font-semibold mb-3">
                  Số lượng
                </Title>
                <div className="flex items-center">
                  <InputNumber
                    min={1}
                    max={currentQuantity}
                    value={quantity}
                    onChange={setQuantity}
                    className="w-20"
                  />
                  <Text className="ml-3 text-gray-500">
                    Số lượng hiện có:{" "}
                    {currentQuantity !== null ? currentQuantity : "Đang tải..."}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[90%] mx-auto mt-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Title level={3} className="flex items-center mb-6">
            <CommentOutlined className="mr-2" /> Đánh giá từ khách hàng
          </Title>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Tổng quan đánh giá */}
            <div className="col-span-1 border-r border-gray-200 pr-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-indigo-600">
                  {reviewStats.average}
                </div>
                <Rate
                  disabled
                  defaultValue={reviewStats.average}
                  allowHalf
                  className="text-xl my-2"
                />
                <div className="text-gray-500">
                  {reviewStats.total} đánh giá
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((star, index) => (
                  <div key={star} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600">{star} sao</div>
                    <Progress
                      percent={Math.round(
                        (reviewStats.distribution[5 - star] /
                          reviewStats.total) *
                          100
                      )}
                      size="small"
                      strokeColor="#4F46E5"
                      className="flex-grow mx-2"
                      showInfo={false}
                    />
                    <div className="w-10 text-right text-sm text-gray-600">
                      {reviewStats.distribution[5 - star]}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button
                  type="primary"
                  icon={<CommentOutlined />}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Viết đánh giá
                </Button>
              </div>
            </div>

            {/* Danh sách đánh giá */}
            <div className="col-span-2">
              <div className="flex justify-between items-center mb-4">
                <Title level={5} className="m-0">
                  {reviewStats.total} đánh giá
                </Title>
                <Dropdown
                  overlay={
                    <Menu
                      onClick={(e) => setReviewFilter(e.key)}
                      selectedKeys={[reviewFilter]}
                    >
                      <Menu.Item key="all">Tất cả đánh giá</Menu.Item>
                      <Menu.Item key="5">5 sao</Menu.Item>
                      <Menu.Item key="4">4 sao</Menu.Item>
                      <Menu.Item key="3">3 sao</Menu.Item>
                      <Menu.Item key="2">2 sao</Menu.Item>
                      <Menu.Item key="1">1 sao</Menu.Item>
                      <Menu.Item key="with_images">Có hình ảnh</Menu.Item>
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <Button icon={<FilterOutlined />}>
                    Lọc đánh giá <span className="ml-1">▼</span>
                  </Button>
                </Dropdown>
              </div>

              {reviews.length > 0 ? (
                <List
                  className="comment-list"
                  itemLayout="horizontal"
                  dataSource={reviews}
                  split
                  renderItem={(item) => (
                    <List.Item
                      className="py-4 border-b border-gray-100"
                      actions={[
                        <span className="text-gray-500 flex items-center">
                          <LikeOutlined className="mr-1" /> {item.likes}
                        </span>,
                      ]}
                    >
                      <div className="w-full">
                        <div className="flex items-start">
                          <Avatar
                            src={item.avatar}
                            size={48}
                            icon={<UserOutlined />}
                          />
                          <div className="ml-4 flex-grow">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                              <Title level={5} className="m-0">
                                {item.author}
                              </Title>
                              <div className="flex items-center mt-1 sm:mt-0">
                                {renderStars(item.rating)}
                              </div>
                            </div>
                            <div className="text-gray-500 text-sm">
                              {formatReviewDate(item.date)}
                            </div>
                            <div className="mt-3 text-gray-700">
                              {item.content}
                            </div>

                            {item.images.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {item.images.map((img, index) => (
                                  <div
                                    key={index}
                                    className="w-16 h-16 rounded overflow-hidden"
                                  >
                                    <Image
                                      src={img}
                                      alt={`review-image-${index}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                  pagination={{
                    onChange: (page) => setReviewPage(page),
                    pageSize: 5,
                    total: reviewStats.total,
                    current: reviewPage,
                    showSizeChanger: false,
                    className: "mt-6",
                  }}
                />
              ) : (
                <Empty
                  description="Chưa có đánh giá nào cho sản phẩm này"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className="py-12"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
