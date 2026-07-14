import React, { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Vì Backend chưa có Role phân quyền, tạm thời chỉ check đăng nhập
    // Nếu chưa đăng nhập thì đẩy về Login
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const navItems = [
    { name: "Sản phẩm", path: "/admin/products", icon: "bi-box-seam" },
    { name: "Thêm sản phẩm", path: "/admin/product/add", icon: "bi-plus-circle" },
    { name: "Đơn hàng", path: "/admin/orders", icon: "bi-receipt" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col bg-white border-r border-gray-200 dark:border-gray-700 dark:bg-gray-800 md:flex">
        <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-700">
          <a href="/" className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-400">
            MyShop <span className="text-xs font-bold text-gray-400">ADMIN</span>
          </a>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            <h3 className="px-3 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400 mb-2">Quản lý</h3>
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <i className={`bi ${item.icon} text-lg ${isActive ? "" : "text-gray-400 dark:text-gray-500"}`}></i>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <a href="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50">
            <i className="bi bi-shop text-gray-400 dark:text-gray-500"></i> Xem cửa hàng
          </a>
          <button onClick={handleLogout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30">
            <i className="bi bi-box-arrow-left text-red-400 dark:text-red-500"></i> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800 md:hidden">
          <a href="/" className="text-lg font-black tracking-tight text-blue-600 dark:text-blue-400">
            MyShop ADMIN
          </a>
          <button className="text-gray-500 dark:text-gray-300">
            <i className="bi bi-list text-2xl"></i>
          </button>
        </header>

        {/* Content Area for Nested Routes */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
