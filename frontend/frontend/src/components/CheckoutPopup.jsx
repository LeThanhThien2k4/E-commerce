import React, { useState } from "react";
import axios from "../axios";

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, handleCheckout }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const onConfirm = async () => {
    if (!shippingAddress.trim()) {
      alert("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }

    setIsProcessing(true);
    try {
      // Gọi handleCheckout từ parent để tạo order, trả về orderId & totalPrice
      const result = await handleCheckout(shippingAddress, paymentMethod);

      // Nếu chọn VNPAY → gọi BE lấy URL rồi redirect
      if (paymentMethod === "VNPAY" && result?.orderId) {
        const res = await axios.post("/orders/create-vnpay-payment", null, {
          params: {
            amount: result.totalPrice ?? totalPrice,
            orderId: result.orderId,
          },
        });

        if (res.data?.paymentUrl) {
          window.location.href = res.data.paymentUrl;
          return; // Dừng lại, trang sẽ redirect
        } else {
          alert("Không lấy được URL thanh toán VNPAY. Vui lòng thử lại.");
        }
      }
      // COD → đóng popup (parent tự xử lý toast/navigate)
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-800 animate-[fade-in-up_0.3s_ease-out]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-700">
          <h4 className="text-xl font-black text-gray-900 dark:text-white">Xác Nhận Đơn Hàng</h4>
          {!isProcessing && (
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <i className="bi bi-x-lg text-lg"></i>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">

          {/* Danh sách sản phẩm */}
          <div className="mb-6 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 p-1 dark:bg-gray-700">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                  />
                </div>
                <div className="flex-1">
                  <h6 className="line-clamp-1 font-bold text-gray-900 dark:text-white">{item.name}</h6>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    SL: <span className="font-semibold text-gray-900 dark:text-gray-200">{item.quantity}</span>
                  </p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {((item.price || 0) * (item.quantity || 1)).toLocaleString("vi-VN")} VND
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className="rounded-2xl bg-gray-50 p-6 dark:bg-gray-700/30">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Tạm tính</span>
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                {(totalPrice || 0).toLocaleString("vi-VN")} VND
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Phí giao hàng</span>
              <span className="font-bold text-green-600 dark:text-green-400">Miễn phí</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-600">
              <span className="text-base font-bold text-gray-900 dark:text-white">Tổng cộng</span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                {(totalPrice || 0).toLocaleString("vi-VN")} VND
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="mt-8 space-y-6">

            {/* Địa chỉ */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900 dark:text-white">
                Địa chỉ giao hàng
              </label>
              <textarea
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900"
                rows="3"
                placeholder="Nhập địa chỉ nhận hàng chi tiết..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </div>

            {/* Phương thức thanh toán */}
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900 dark:text-white">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* COD */}
                <label
                  className={`relative flex cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${
                    paymentMethod === "COD"
                      ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 dark:bg-blue-900/20"
                      : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                    />
                    <div className="flex flex-col">
                      <span className="block text-sm font-bold text-gray-900 dark:text-white">Tiền mặt (COD)</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Thanh toán khi nhận hàng</span>
                    </div>
                  </div>
                </label>

                {/* VNPAY */}
                <label
                  className={`relative flex cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${
                    paymentMethod === "VNPAY"
                      ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 dark:bg-blue-900/20"
                      : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                      name="paymentMethod"
                      value="VNPAY"
                      checked={paymentMethod === "VNPAY"}
                      onChange={() => setPaymentMethod("VNPAY")}
                    />
                    <div className="flex flex-col">
                      <span className="block text-sm font-bold text-gray-900 dark:text-white">Ví VNPay</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Thẻ ATM / QR Pay</span>
                    </div>
                  </div>
                </label>

              </div>

              {/* Ghi chú khi chọn VNPAY */}
              {paymentMethod === "VNPAY" && (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-xs text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <i className="bi bi-info-circle-fill"></i>
                  Bạn sẽ được chuyển sang trang VNPAY để hoàn tất thanh toán.
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold tracking-wide text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:opacity-70"
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <i className="bi bi-shield-lock-fill"></i>
                <span>
                  {paymentMethod === "VNPAY" ? "Thanh Toán Với VNPAY" : "Xác Nhận & Đặt Hàng"}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPopup;