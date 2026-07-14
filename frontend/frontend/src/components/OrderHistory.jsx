import React, { useState, useEffect } from "react";
import axios from "../axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedObjectUrls, setLoadedObjectUrls] = useState([]); // Theo dõi URL để dọn dẹp
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderHistory();

    // Dọn dẹp bộ nhớ (revoke Blob URL) khi component bị hủy
    return () => {
      loadedObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("Vui lòng đăng nhập để xem lịch sử đơn hàng!");
        navigate("/login");
        return;
      }

      const response = await axios.get("/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const sortedOrders = Array.isArray(response.data) ? response.data.reverse() : [];
      let tempUrls = [];

      // Nhúng tính năng tải ảnh Blob cho từng món hàng trong đơn
      const enrichedOrders = await Promise.all(
        sortedOrders.map(async (order) => {
          if (!order.items || order.items.length === 0) return order;

          const itemsWithImages = await Promise.all(
            order.items.map(async (item) => {
              if (!item.product || !item.product.id) return item;
              
              try {
                const imgResponse = await axios.get(
                  `/product/${item.product.id}/image`,
                  { responseType: "blob" }
                );
                const imageUrl = URL.createObjectURL(imgResponse.data);
                tempUrls.push(imageUrl);
                return { ...item, imageUrl };
              } catch (error) {
                console.error(`Lỗi tải ảnh cho Product ID ${item.product.id}`);
                return item; // Trả về nguyên gốc nếu lỗi tải ảnh
              }
            })
          );
          
          return { ...order, items: itemsWithImages };
        })
      );

      setLoadedObjectUrls(prevUrls => [...prevUrls, ...tempUrls]);
      setOrders(enrichedOrders);
    } catch (error) {
      console.error("Lỗi lấy lịch sử đơn hàng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeOptions = (status) => {
    // Thêm .trim() để lỡ DB bị dính dấu cách dư thừa ở đuôi thì vẫn ăn màu
    switch (status?.toUpperCase()?.trim()) {
      case "PENDING": // Đổi chữ PENDING thành chữ giống hệt trong Enum Java của bạn
        return { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Chờ xác nhận" };
      case "SHIPPING": 
        return { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Đang giao" };
      case "COMPLETED": // Ví dụ nếu Java là DELIVERED thì sửa COMPLETED thành DELIVERED
        return { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Hoàn thành" };
      case "CANCELLED":
        return { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Đã hủy" };
      default:
        // Nếu không khớp cái nào ở trên, nó sẽ hiện text mộc và màu xám
        return { color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", label: status || "Không rõ" };
    }
  };


  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-gray-800">
          
          <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-6 dark:border-gray-700 dark:bg-gray-800/50 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Lịch sử đơn hàng</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Theo dõi quá trình giao hàng của bạn</p>
            </div>
            <Link to="/" className="text-sm font-semibold text-blue-600 hover:text-blue-500 hover:underline">
               Tiếp tục mua sắm
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <i className="bi bi-box-seam text-4xl text-gray-400 dark:text-gray-500"></i>
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Chưa có đơn hàng nào</h2>
              <p className="mb-6 text-gray-500 dark:text-gray-400">Bạn chưa từng đặt đơn hàng nào trên hệ thống.</p>
              <Link to="/" className="rounded-full bg-blue-600 px-8 py-3 font-bold text-white shadow-md transition-colors hover:bg-blue-700">
                Trải nghiệm mua sắm ngay
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700 p-4 space-y-4">
              {orders.map((order) => {

                const activeStatus = order.orderStatus;
                const badge = getStatusBadgeOptions(activeStatus);

                const amount = order.totalPrice || 0; 
                const orderDate = order.createdAt;

                return (
                  <div key={order.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-gray-100 dark:border-gray-700 gap-4">
                      <div>
                        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Mã Đơn: #{order.id}</p>
                        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                           Ngày tạo: {orderDate ? new Date(orderDate).toLocaleString('vi-VN') : "Không rõ"}
                        </p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold text-center self-start sm:self-auto ${badge.color}`}>
                         {badge.label}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="py-4 space-y-4">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => {
                           const productName = item.product?.name || "Sản phẩm";
                           
                           return (
                             <div key={idx} className="flex items-center gap-4">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 p-2 dark:bg-gray-700">
                                   {item.imageUrl ? (
                                     <img src={item.imageUrl} alt={productName} className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                   ) : (
                                     <div className="h-full w-full bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                                        <i className="bi bi-image text-gray-400"></i>
                                     </div>
                                   )}
                                </div>
                                <div className="flex-1">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{productName}</h4>
                                   <p className="text-xs text-gray-500 dark:text-gray-400">SL: x{item.quantity}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                     {item.price ? item.price.toLocaleString("vi-VN") + " đ" : ""}
                                   </p>
                                </div>
                             </div>
                           );
                        })
                      ) : (
                         <div className="text-sm text-gray-500 italic dark:text-gray-400">
                            Không tải được chi tiết sản phẩm (hoặc đơn hàng không có sản phẩm).
                         </div>
                      )}
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center pt-4 border-t border-gray-100 dark:border-gray-700 gap-4">
                       <div className="text-sm text-gray-600 dark:text-gray-400">
                          Phương thức: <span className="font-bold text-gray-900 dark:text-white">{order.paymentMethod || "COD"}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">Tổng thanh toán:</span>
                          <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                             {amount.toLocaleString("vi-VN")} VND
                          </span>
                       </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
