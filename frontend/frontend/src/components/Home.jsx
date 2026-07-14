import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import axios from "../axios";
import AppContext from "../context/Context";
import { toast } from 'react-toastify';
import Sidebar from "./Sidebar";


const Home = ({ selectedCategory, selectedBrand, onSelectCategory, onSelectBrand, onClearCategory }) => {
  const navigate = useNavigate();
  const { data, isError, addToCart, refreshData } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [priceInitialized, setPriceInitialized] = useState(false);

  useEffect(() => {
      refreshData();
  }, []);

  useEffect(() => {
    let isComponentMounted = true;
    let objectUrls = []; // Lưu lại để cleanup

    // Cập nhật state products bằng data đã có imageUrl
    if (data && data.length > 0) {
      const fetchImagesAndUpdateProducts = async () => {
        const updatedProducts = await Promise.all(
          data.map(async (product) => {
            // 1. Lấy ảnh
            let imageUrl = "placeholder-image-url";
            try {
              const response = await axios.get(
                `product/${product.id}/image`,
                { responseType: "blob" }
              );
              imageUrl = URL.createObjectURL(response.data);
              objectUrls.push(imageUrl);
            } catch (error) {
              console.error("Error fetching image for product ID:", product.id, error);
            }

            // 2. Lấy điểm đánh giá trung bình
            let avgRating = 0;
            let reviewCount = 0;
            try {
              const reviewRes = await axios.get(`reviews/product/${product.id}`);
              const reviews = reviewRes.data;
              reviewCount = reviews.length;
              if (reviewCount > 0) {
                avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;
              }
            } catch (error) {
              // Không có review, giữ mặc định là 0
            }

            return { ...product, imageUrl, avgRating, reviewCount };
          })
        );
        if (isComponentMounted) {
          setProducts(updatedProducts);
        }
      };

      fetchImagesAndUpdateProducts();
    }
    return () => {
      isComponentMounted = false;
    objectUrls.forEach(url => URL.revokeObjectURL(url));
  };
  }, [data]);

  // Tính khoảng giá toàn cục từ toàn bộ sản phẩm (không phụ thuộc category/brand)
  const globalMinPrice = useMemo(() => {
    if (!products || products.length === 0) return 0;
    return Math.min(...products.map(p => p.price || 0));
  }, [products]);

  const globalMaxPrice = useMemo(() => {
    if (!products || products.length === 0) return 0;
    return Math.max(...products.map(p => p.price || 0));
  }, [products]);

  // Khởi tạo priceRange một lần duy nhất khi products load lần đầu
  useEffect(() => {
    if (!priceInitialized && products.length > 0) {
      const min = Math.min(...products.map(p => p.price || 0));
      const max = Math.max(...products.map(p => p.price || 0));
      setPriceRange([min, max]);
      setPriceInitialized(true);
    }
  }, [products, priceInitialized]);

  const filteredProducts = products.filter((product) => {
    const matchCat = selectedCategory ? product.category === selectedCategory : true;
    const matchBrand = selectedBrand ? product.brand === selectedBrand : true;
    const matchPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchCat && matchBrand && matchPrice;
  });
  const handleAddToCart = async (e, product) => {
  
    e.preventDefault(); 
    e.stopPropagation();
    
  const result = await addToCart(product); // Gọi hàm từ Context
  
    if (result.success) {
        toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
    } else {
      // Nếu lỗi do chưa đăng nhập
      if (result.message.includes("đăng nhập")) {
        toast.warning("Vui lòng đăng nhập để mua hàng!");
        navigate("/login");
      } else {
        toast.error(result.message);
      }
    }
};

  if (!products) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Đang tải sản phẩm...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Cột Sidebar (Trái) */}
           <div className="hidden lg:block lg:w-64 flex-shrink-0 relative z-50">
             <Sidebar 
               selectedCategory={selectedCategory} 
               selectedBrand={selectedBrand} 
               onSelectCategory={onSelectCategory} 
               onSelectBrand={onSelectBrand}
               priceRange={priceRange}
               onPriceRangeChange={setPriceRange}
               globalMinPrice={globalMinPrice}
               globalMaxPrice={globalMaxPrice}
             />
           </div>

          {/* Cột Nội dung chính (Phải) */}
          <div className="flex-1 min-w-0">
            {/* Banner hiển thị Danh mục đang chọn */}
            {selectedCategory && (
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-blue-50 px-6 py-4 shadow-sm dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center gap-3">
              <div className="flex flex-shrink-0 h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-800/50 dark:text-blue-400">
                <i className="bi bi-tags-fill"></i>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">Đang lọc theo danh mục</p>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedCategory} {selectedBrand && <span className="text-gray-500"> / {selectedBrand}</span>}
                </h2>
              </div>
            </div>
            <button 
              onClick={onClearCategory}
              className="group flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-inset ring-gray-200 transition-all hover:bg-red-50 hover:text-red-600 hover:ring-red-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-red-900/30 dark:hover:text-red-400 dark:hover:ring-red-900/50"
            >
              <i className="bi bi-x-circle-fill text-gray-400 transition-colors group-hover:text-red-500 dark:text-gray-500"></i> Bỏ lọc
            </button>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-gray-400 dark:text-gray-500">
              Không có sản phẩm nào
            </h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const { id, brand, name, price, available, imageUrl } = product;

              return (
                <div
                  key={id}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800 ${
                    !available ? "opacity-75 grayscale-[30%]" : ""
                  }`}
                >
                  <Link to={`/product/${id}`} className="flex h-full flex-col">
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100 p-4 dark:bg-gray-700">
                      <img
                        src={imageUrl}
                        alt={name}
                        className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 dark:mix-blend-normal"
                      />
                      {!available && (
                        <div className="absolute top-3 right-3 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                          Hết hàng
                        </div>
                      )}
                    </div>

                    {/* Content Container */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-2">
                        <span className="text-xs font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                          {brand}
                        </span>
                        <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-tight text-gray-900 dark:text-white">
                          {name?.toUpperCase() || "NO NAME"}
                        </h3>

                        {/* Điểm Sao Đánh Giá Động */}
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="flex text-yellow-400 text-sm">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const avg = product.avgRating || 0;
                              if (star <= Math.floor(avg)) {
                                return <i key={star} className="bi bi-star-fill"></i>;
                              } else if (star === Math.ceil(avg) && avg % 1 >= 0.5) {
                                return <i key={star} className="bi bi-star-half"></i>;
                              } else {
                                return <i key={star} className="bi bi-star text-gray-300"></i>;
                              }
                            })}
                          </div>
                          {product.reviewCount > 0 ? (
                            <span className="text-xs text-gray-400 font-medium">
                              ({product.avgRating?.toFixed(1)}) &middot; {product.reviewCount} đánh giá
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Chưa có đánh giá</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto pt-4 relative">
                        <div className="flex items-end justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Giá bán</span>
                            <span className="text-xl font-black text-gray-900 dark:text-white">
                              {price.toLocaleString("vi-VN")} <span className="text-sm font-semibold text-gray-500">VND</span>
                            </span>
                          </div>
                          
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={!available}
                            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                              available
                                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                                : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                            }`}
                            title={available ? "Thêm vào giỏ" : "Hết hàng"}
                          >
                            <i className="bi bi-cart-plus-fill text-lg"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;