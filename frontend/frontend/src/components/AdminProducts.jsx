import React, { useState, useEffect } from "react";
import axios from "../axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products function
  const fetchProducts = async () => {
    try {
      const response = await axios.get("/products");
      // Sắp xếp ID giảm dần (mới nhất lên trên)
      const sortedProducts = response.data.sort((a, b) => b.id - a.id);
      setProducts(sortedProducts);
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
      toast.error("Không thể tải danh sách sản phẩm!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteClick = async (id) => {
    const isConfirm = window.confirm("Trường hợp xóa sản phẩm cứng có thể gây lỗi nếy sản phẩm này đã nằm trong Đơn hàng của khách.\n\nBạn có chắc chắn muốn XÓA hoàn toàn sản phẩm này khỏi Database?");
    if (!isConfirm) return;
    
    try {
      await axios.delete(`/product/${id}`);
      toast.success("Xóa sản phẩm thành công!");
      fetchProducts(); // Tải lại danh sách
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Xóa thất bại! Có thể sản phẩm này đang dính khóa ngoại (Đã được đặt hàng).");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Quản lý Sản phẩm</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản trị toàn bộ hàng hóa trong hệ thống</p>
        </div>
        <Link 
          to="/admin/product/add" 
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-700 active:scale-95"
        >
          <i className="bi bi-plus-lg"></i> Thêm mới
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th scope="col" className="px-6 py-4">ID</th>
                <th scope="col" className="px-6 py-4">Sản Phẩm</th>
                <th scope="col" className="px-6 py-4">Hãng</th>
                <th scope="col" className="px-6 py-4">Kho</th>
                <th scope="col" className="px-6 py-4">Giá bán</th>
                <th scope="col" className="px-6 py-4 text-center">Trạng thái</th>
                <th scope="col" className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">#{product.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
                      <span className="text-xs text-gray-500 line-clamp-1">{product.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-bold text-gray-500">{product.brand}</td>
                  <td className="px-6 py-4">
                    {product.quantity > 0 ? (
                      <span className="font-bold text-gray-900 dark:text-white">{product.quantity}</span>
                    ) : (
                      <span className="text-red-500 font-bold">Hết</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">
                    {product.price?.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="px-6 py-4 text-center">
                    {product.available ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">Hiện</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-400">Ẩn</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <Link 
                           to={`/admin/product/update/${product.id}`}
                           className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                           title="Sửa"
                        >
                           <i className="bi bi-pencil-square"></i>
                        </Link>
                        <button 
                           onClick={() => handleDeleteClick(product.id)}
                           className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                           title="Xóa mềm"
                        >
                           <i className="bi bi-trash3-fill"></i>
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                 <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Không có sản phẩm nào.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
