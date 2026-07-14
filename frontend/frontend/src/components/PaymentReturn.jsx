import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../axios";
import { toast } from "react-toastify";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // 'processing', 'success', 'failed'

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        // Collect all VNPay params from URL to send to backend for verification
        const responseCode = searchParams.get("vnp_ResponseCode");
        const txnRef = searchParams.get("vnp_TxnRef");
        
        if (!responseCode || !txnRef) {
          setStatus("failed");
          return;
        }

        // Call our backend API to securely update the order status
        await axios.get(`/orders/vnpay-return`, { 
            params: Object.fromEntries([...searchParams]) 
        });

        if (responseCode === "00") {
          setStatus("success");
          toast.success("Thanh toán thành công!");
        } else {
          setStatus("failed");
          toast.error(`Thanh toán thất bại! Mã lỗi: ${responseCode}`);
        }
      } catch (error) {
        console.error("Error processing payment return:", error);
        setStatus("failed");
        toast.error("Đã xảy ra lỗi hệ thống khi đồng bộ thanh toán.");
      }
    };

    processPaymentReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="p-8 text-center sm:p-10">
          {status === "processing" && (
            <div className="flex flex-col items-center">
              <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <h3 className="mb-2 text-2xl font-black tracking-tight text-gray-900 dark:text-white">Đang Xử Lý Giao Dịch</h3>
              <p className="text-gray-500 dark:text-gray-400">Vui lòng không đóng cửa sổ trình duyệt này...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center animate-[fade-in-up_0.5s_ease-out]">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <i className="bi bi-check-lg text-5xl text-green-500"></i>
              </div>
              <h2 className="mb-4 text-3xl font-black tracking-tight text-gray-900 dark:text-white">Thanh Toán Hoàn Tất</h2>
              <p className="mb-8 leading-relaxed text-gray-500 dark:text-gray-400">
                Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được ghi nhận và đang chuẩn bị giao.
              </p>
              <button className="w-full rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95" onClick={() => navigate("/")}>
                Tiếp tục mua sắm
              </button>
            </div>
          )}

          {status === "failed" && (
            <div className="flex flex-col items-center animate-[fade-in-up_0.5s_ease-out]">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <i className="bi bi-x-lg text-5xl text-red-500"></i>
              </div>
              <h2 className="mb-4 text-3xl font-black tracking-tight text-gray-900 dark:text-white">Giao Dịch Thất Bại</h2>
              <p className="mb-8 leading-relaxed text-gray-500 dark:text-gray-400">
                Quá trình thanh toán không thành công hoặc đã bị hủy. Vui lòng thanh toán lại.
              </p>
              <button className="w-full rounded-2xl border-2 border-red-500 bg-transparent px-8 py-4 font-bold text-red-500 transition-all hover:bg-red-50 active:scale-95 dark:hover:bg-red-900/20" onClick={() => navigate("/cart")}>
                Quay lại giỏ hàng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentReturn;
