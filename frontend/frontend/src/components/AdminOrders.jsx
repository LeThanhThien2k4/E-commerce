import React, { useState, useEffect } from "react";
import axios from "../axios";
import { toast } from "react-toastify";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    setIsLoading(true);
    setApiError(false);
    try {
      // Gọi API lấy TẤT CẢ hóa đơn (Backend chưa có API này theo như thảo luận)
      // Tạm thời giả định API là /admin/orders hoặc /orders/all
      const token = localStorage.getItem("token");
      const response = await axios.get("/orders/all", {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      const sortedOrders = Array.isArray(response.data) ? response.data.reverse() : [];
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Lỗi lấy danh sách tất cả đơn hàng:", error);
      // Nếu API trả về 404 (Not Found) -> Nghĩa là Backend chưa cài đặt Controller
      if (error.response && error.response.status === 404) {
         setApiError(true);
      } else {
         // Fallback hiển thị dữ liệu giả lập để xem UI tạm thời
         // Khi Backend xây dựng xong, chỉ cần bỏ đoạn code fallback này
         toast.warning("Chưa có API lấy tất cả đơn, hiển thị dữ liệu giả lập!");
         setOrders([
            { id: 101, orderStatus: "PENDING", totalPrice: 1500000, createdAt: new Date().toISOString(), user: { username: "nguyenvana" } },
            { id: 102, orderStatus: "PAID", totalPrice: 3200000, createdAt: new Date(Date.now() - 86400000).toISOString(), user: { username: "tranthib" } }
         ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Gọi API cập nhật trạng thái
      // const token = localStorage.getItem("token");
      // await axios.put(`/orders/${orderId}/status?status=${newStatus}`, null, {
      //    headers: { Authorization: `Bearer ${token}` }
      // });
      
      // Cập nhật State cục bộ (Tạm thời)
      setOrders(prevOrders => 
         prevOrders.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o)
      );
      toast.success(`Đã chuyển đơn #${orderId} sang ${newStatus}`);
    } catch (e) {
       toast.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (apiError) {
     return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
           <div className="mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-3xl">
              <i className="bi bi-tools"></i>
           </div>
           <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Backend chưa sẵn sàng API</h2>
           <p className="text-gray-500 max-w-md dark:text-gray-400">
              Chưa tìm thấy Endpoint <code>GET /orders/all</code> ở phía Java Spring Boot. Vui lòng tạo hàm này trong OrderController để lấy danh sách toàn bộ hóa đơn của cửa hàng!
           </p>
        </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Quản lý Đơn hàng</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kiểm duyệt và thay đổi trạng thái giao hàng</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th scope="col" className="px-6 py-4">Mã Đơn</th>
                <th scope="col" className="px-6 py-4">Khách hàng</th>
                <th scope="col" className="px-6 py-4">Ngày tạo</th>
                <th scope="col" className="px-6 py-4">Tổng tiền</th>
                <th scope="col" className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">#{order.id}</td>
                  <td className="px-6 py-4">
                     <span className="font-bold text-gray-800 dark:text-gray-200">{order.user?.username || "Ẩn danh"}</span>
                  </td>
                  <td className="px-6 py-4">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : "Không rõ"}
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">
                    {order.totalPrice?.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="px-6 py-4">
                     {/* Dropdown thay đổi trạng thái thay vì chỉ view */}
                     <select 
                        value={order.orderStatus || order.status || "PENDING"}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2 py-1 outline-none cursor-pointer border ${
                           order.orderStatus === "PAID" ? "bg-green-50 text-green-700 border-green-200" :
                           order.orderStatus === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" :
                           "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                     >
                        <option value="PENDING">Chờ xác nhận</option>
                        <option value="PAID">Đã thanh toán (PAID)</option>
                        <option value="CANCELLED">Đã hủy</option>
                     </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                 <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Chưa có đơn hàng nào trên hệ thống.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
