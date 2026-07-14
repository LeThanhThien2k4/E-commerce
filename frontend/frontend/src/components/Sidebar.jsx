import React, { useContext, useMemo, useCallback } from 'react';
import AppContext from '../context/Context';

const CATEGORY_ICONS = {
  "Laptop": "bi-laptop",
  "Điện thoại": "bi-phone",
  "Tablet": "bi-tablet",
  "Đồng hồ": "bi-smartwatch",
  "Tai nghe": "bi-headphones",
  "Phụ kiện": "bi-usb-drive",
  "Tivi": "bi-tv",
  "PC": "bi-pc-display"
};

const Sidebar = ({ selectedCategory, selectedBrand, onSelectCategory, onSelectBrand, priceRange, onPriceRangeChange, globalMinPrice, globalMaxPrice }) => {
  const { data } = useContext(AppContext);
  
  const dynamicCategories = useMemo(() => {
    return data && data.length > 0 
      ? [...new Set(data.map(product => product.category))].filter(Boolean)
      : [];
  }, [data]);

  const categoryBrands = useMemo(() => {
    if (!data) return {};
    const map = {};
    data.forEach(product => {
      const cat = product.category;
      const brand = product.brand;
      if (cat && brand) {
        if (!map[cat]) map[cat] = new Set();
        map[cat].add(brand);
      }
    });
    Object.keys(map).forEach(cat => {
      map[cat] = Array.from(map[cat]);
    });
    return map;
  }, [data]);

  const getIconForCategory = (category) => {
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes("laptop")) return CATEGORY_ICONS["Laptop"];
    if (lowerCat.includes("điện thoại") || lowerCat.includes("phone")) return CATEGORY_ICONS["Điện thoại"];
    if (lowerCat.includes("tablet") || lowerCat.includes("máy tính bảng")) return CATEGORY_ICONS["Tablet"];
    if (lowerCat.includes("đồng hồ") || lowerCat.includes("watch")) return CATEGORY_ICONS["Đồng hồ"];
    if (lowerCat.includes("tai nghe") || lowerCat.includes("âm thanh")) return CATEGORY_ICONS["Tai nghe"];
    if (lowerCat.includes("tivi") || lowerCat.includes("tv")) return CATEGORY_ICONS["Tivi"];
    if (lowerCat.includes("pc") || lowerCat.includes("màn hình") || lowerCat.includes("máy tính")) return CATEGORY_ICONS["PC"];
    return "bi-grid"; // Default icon
  };

  // === ALL HOOKS MUST BE ABOVE EARLY RETURN ===
  const formatPrice = (value) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}tỷ`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}tr`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return `${value}`;
  };

  const handleMinChange = useCallback((e) => {
    const newMin = Math.min(Number(e.target.value), priceRange[1] - 1);
    onPriceRangeChange([newMin, priceRange[1]]);
  }, [priceRange, onPriceRangeChange]);

  const handleMaxChange = useCallback((e) => {
    const newMax = Math.max(Number(e.target.value), priceRange[0] + 1);
    onPriceRangeChange([priceRange[0], newMax]);
  }, [priceRange, onPriceRangeChange]);

  const minPercent = globalMaxPrice > globalMinPrice
    ? ((priceRange[0] - globalMinPrice) / (globalMaxPrice - globalMinPrice)) * 100
    : 0;
  const maxPercent = globalMaxPrice > globalMinPrice
    ? ((priceRange[1] - globalMinPrice) / (globalMaxPrice - globalMinPrice)) * 100
    : 100;

  // === EARLY RETURN (after all hooks) ===
  if (dynamicCategories.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-white shadow-sm p-4 dark:bg-gray-800 animate-pulse">
         <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 dark:bg-gray-700"></div>
         <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 dark:bg-gray-700"></div>
         <div className="h-6 bg-gray-200 rounded w-5/6 dark:bg-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-white shadow-sm dark:bg-gray-800 overflow-visible sticky top-24 z-50">
      <div className="flex flex-col py-2">
        {/* Nút "Tất cả sản phẩm" */}
        <button
          onClick={() => onSelectCategory("")}
          className={`group flex items-center justify-between px-4 py-2.5 transition-colors
            ${!selectedCategory 
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-red-600 dark:text-gray-200 dark:hover:bg-gray-700'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <i className={`bi bi-ui-radios-grid text-lg ${!selectedCategory ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'}`}></i>
            <span className="text-sm font-medium text-left">Tất cả sản phẩm</span>
          </div>
          <i className="bi bi-chevron-right text-[10px] text-gray-400 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </button>

        {dynamicCategories.map((category) => {
          const isActive = selectedCategory === category;
          const brands = categoryBrands[category] || [];
          return (
            <div key={category} className="group relative">
              <button
                onClick={() => onSelectCategory(category)}
                className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors
                  ${isActive 
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-red-600 dark:text-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <i className={`bi ${getIconForCategory(category)} text-lg ${isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-red-500'}`}></i>
                  <span className="text-sm font-medium text-left line-clamp-1">{category}</span>
                </div>
                <i className="bi bi-chevron-right text-[10px] text-gray-400 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </button>

              {/* Flyout Brands Menu */}
              {brands.length > 0 && (
                <div className="absolute left-full top-0 ml-1 hidden w-48 rounded-xl bg-white p-2 shadow-xl border border-gray-100 dark:border-gray-700 dark:bg-gray-800 group-hover:block z-50 before:absolute before:-left-2 before:top-0 before:h-full before:w-2">
                  <div className="flex flex-col">
                    <span className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 dark:border-gray-700 mb-1">
                      Thương hiệu
                    </span>
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBrand(category, brand);
                        }}
                        className={`text-left px-3 py-2 text-sm rounded-lg transition-colors
                          ${selectedBrand === brand && selectedCategory === category
                            ? 'bg-red-50 text-red-600 font-bold dark:bg-red-900/30 dark:text-red-400'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-red-500 dark:text-gray-300 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ===== BỘ LỌC GIÁ ===== */}
        {globalMaxPrice > 0 && (
          <div className="mx-3 mt-3 mb-2 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="bi bi-currency-dollar text-red-500 text-base"></i>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Lọc theo giá</span>
              </div>
              <button
                onClick={() => onPriceRangeChange([globalMinPrice, globalMaxPrice])}
                className="text-[10px] font-semibold text-red-400 hover:text-red-600 transition-colors"
                title="Đặt lại bộ lọc giá"
              >
                Đặt lại
              </button>
            </div>

            {/* Giá hiển thị */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-2 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm">
                {formatPrice(priceRange[0])}
              </span>
              <div className="flex-1 mx-2 h-px bg-gray-200 dark:bg-gray-600"></div>
              <span className="inline-flex items-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-2 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm">
                {formatPrice(priceRange[1])}
              </span>
            </div>

            {/* Dual Range Slider */}
            <div className="relative h-5 flex items-center">
              {/* Track background */}
              <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
              {/* Track highlighted */}
              <div
                className="absolute h-1.5 bg-red-500 rounded-full"
                style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
              ></div>
              {/* Min slider */}
              <input
                id="price-min-slider"
                type="range"
                min={globalMinPrice}
                max={globalMaxPrice}
                step={Math.max(1, Math.floor((globalMaxPrice - globalMinPrice) / 200))}
                value={priceRange[0]}
                onChange={handleMinChange}
                className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer price-slider"
                style={{ zIndex: priceRange[0] > globalMaxPrice - (globalMaxPrice - globalMinPrice) * 0.1 ? 5 : 3 }}
              />
              {/* Max slider */}
              <input
                id="price-max-slider"
                type="range"
                min={globalMinPrice}
                max={globalMaxPrice}
                step={Math.max(1, Math.floor((globalMaxPrice - globalMinPrice) / 200))}
                value={priceRange[1]}
                onChange={handleMaxChange}
                className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer price-slider"
                style={{ zIndex: 4 }}
              />
            </div>

            {/* Min / Max labels */}
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatPrice(globalMinPrice)}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatPrice(globalMaxPrice)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
