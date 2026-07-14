import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để chuyển hướng
import axios from "../axios";
import { useContext } from "react";
import AppContext from "../context/Context";
import { toast } from 'react-toastify';

const Navbar = ({ onSelectCategory, onSearch }) => {
  const navigate = useNavigate();
  


  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme : "light-theme";
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const { data, clearCart, refreshCart, currentUser, logout } = useContext(AppContext);


  // 3. Cập nhật hàm fetchData để gửi kèm Token (tránh lỗi 401)
  const fetchData = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/api/products", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
          handleLogout(); // Nếu token hết hạn, tự động logout
      }
    }
  };

  // Hàm xử lý Logout
  const handleLogout = () => {
    logout();          // Xóa token + clearCart + set currentUser = null trong Context
    toast.info("Bạn đã đăng xuất!");
    navigate("/login");
  };

  const handleChange = async (value) => {
    setInput(value);
    const token = localStorage.getItem("token");
    
    if (value.length >= 1 && token) {
      setShowSearchResults(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/products/search?keyword=${value}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSearchResults(response.data);
        setNoResults(response.data.length === 0);
      } catch (error) {
        console.error("Error searching:", error);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResults(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onSelectCategory(category);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark-theme" ? "light-theme" : "dark-theme";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Lấy các danh mục một cách linh hoạt (Dynamic Categories) từ thư viện data
  const dynamicCategories = data && data.length > 0 
    ? [...new Set(data.map(product => product.category))].filter(Boolean)
    : [];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md dark:bg-gray-900">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">
            MyShop
          </a>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex lg:items-center lg:gap-8">
          <a href="/" className="text-sm font-semibold text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400">Trang chủ</a>
          
          {/* Dropdown Category đã được chuyển sang Sidebar */}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="flex items-center rounded-full bg-gray-100 px-4 py-2 ring-1 ring-transparent transition-all focus-within:bg-white focus-within:ring-blue-500 dark:bg-gray-800 dark:focus-within:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <i className="bi bi-search text-gray-400"></i>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                className="ml-2 w-48 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-white"
              />
            </div>
            {showSearchResults && (
              <div className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl bg-white ring-1 shadow-xl ring-black/5 dark:bg-gray-800 dark:ring-white/10">
                {searchResults.length > 0 ? (
                  <ul className="max-h-64 overflow-y-auto p-2">
                    {searchResults.map((result) => (
                      <li key={result.id}>
                        <a href={`/product/${result.id}`} className="block rounded-lg px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
                          {result.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : noResults && (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Không tìm thấy sản phẩm</div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            data-testid="theme-toggle"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {theme === "dark-theme" ? <i className="bi bi-moon-fill"></i> : <i className="bi bi-sun-fill"></i>}
          </button>

          {/* Cart Icon */}
          <a href="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/40">
            <i className="bi bi-cart3 text-lg"></i>
          </a>

          {/* Auth Button */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-3">
              {currentUser?.role === "USER" && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Chào {currentUser?.username || 'User'} đến với MyShop
                </span>
              )}
              {/* Chỉ hiển nút Admin với tài khoản ADMIN */}
              {currentUser?.role === "ADMIN" && (
                <a href="/admin" className="rounded-full bg-purple-50 px-4 py-2 text-sm font-bold text-purple-600 transition-colors hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-800/40 border border-purple-200 dark:border-purple-800" title="Trang Quản Trị">
                  <i className="bi bi-shield-lock mr-2"></i>Admin
                </a>
              )}
              <a href="/order-history" className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-800/40 border border-emerald-200 dark:border-emerald-800" title="Lịch sử đơn hàng">
                <i className="bi bi-box-seam mr-2"></i>Đơn hàng
              </a>
              <button data-testid="logout-btn" onClick={handleLogout} className="rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/40 border border-red-200 dark:border-red-800">
                Đăng xuất
              </button>
            </div>
          ) : (
            <a href="/login" className="hidden sm:block rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700">
              Đăng nhập
            </a>
          )}

          {/* Mobile Menu Toggle */}
          <button className="flex lg:hidden h-10 w-10 items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <i className="bi bi-list text-2xl"></i>
          </button>

        </div>
      </nav>
    </header>
  );
};

export default Navbar;