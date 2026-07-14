import React, { useContext, useState, useEffect } from "react";
import AppContext from "../context/Context";
import axios from "../axios";
import CheckoutPopup from "./CheckoutPopup.jsx";
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";
const Cart = () => {
  const { cart, removeFromCart , clearCart, refreshCart} = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

useEffect(() => {
  const fetchImagesAndUpdateCart = async () => {
    if (!cart || cart.length === 0) {
      setCartItems([]);
      return;
    }

    try {
      const response = await axios.get("/products");
      const backendProducts = response.data || [];

      const validCartItems = cart
        .map((item) => {
          const productId = item.productId ?? item.product?.id;
          if (!productId) return null;

          const product = backendProducts.find(
            (p) => String(p.id) === String(productId)
          );

          if (!product) return null;

          return {
            ...product,
            cartItemId: item.id,
            stockQuantity: product.quantity ?? 0,
            quantity: item.quantity ?? 0,
            productId: product.id,
          };
        })
        .filter(Boolean);

      let needsRefresh = false;

      const cartItemsWithImages = await Promise.all(
        validCartItems.map(async (item) => {
          let finalQuantity = item.quantity;

          if (item.quantity > item.stockQuantity) {
            finalQuantity = item.stockQuantity;

            try {
              await axios.put("/cart/update", {
                cartItemId: item.cartItemId,
                quantity: finalQuantity,
              });

              if (finalQuantity === 0) {
                toast.error(`Sản phẩm "${item.name}" vừa hết hàng!`);
              } else {
                toast.warning(`Kho vừa hao hụt. Đã tự giảm "${item.name}" xuống ${finalQuantity} cái!`);
              }

              needsRefresh = true;
            } catch (err) {
              console.error("Lỗi Auto-correction:", err);
            }
          }

          try {
            const imgResponse = await axios.get(`/product/${item.id}/image`, {
              responseType: "blob",
            });
            const imageUrl = URL.createObjectURL(imgResponse.data);
            return {
              ...item,
              quantity: finalQuantity,
              imageUrl,
            };
          } catch (error) {
            console.error(`Không tìm thấy ảnh cho sản phẩm ${item.id}`);
            return {
              ...item,
              quantity: finalQuantity,
              imageUrl: "placeholder.png",
            };
          }
        })
      );

      setCartItems(cartItemsWithImages);

      if (needsRefresh) {
        refreshCart();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật giỏ hàng:", error);
    }
  };

  fetchImagesAndUpdateCart();
}, [cart, refreshCart]);

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const converUrlToFile = async (blobData, fileName) => {
    const file = new File([blobData], fileName, { type: blobData.type });
    return file;
  }

// 1. Hàm tăng số lượng
const handleIncreaseQuantity = async (itemId) => {
  try {
    // Tìm item hiện tại trong state để lấy số lượng mới
    const item = cartItems.find(i => i.id === itemId);
    const newQuantity = item.quantity + 1;

    // Gọi API update (Sử dụng axios.put để khớp với @PutMapping ở Backend)
    await axios.put("/cart/update", { 
      cartItemId: item.cartItemId, 
      quantity: newQuantity 
    });

    // Cập nhật lại giỏ hàng trong Context (để đồng bộ toàn app)
    await refreshCart(); 
  } catch (error) {
    toast.error("Số lượng vượt quá tồn kho!");
  }
};

// 2. Hàm giảm số lượng
const handleDecreaseQuantity = async (itemId) => {
  try {
    const item = cartItems.find(i => i.id === itemId);
    
    // Nếu số lượng là 1 mà bấm giảm -> Thực hiện xóa luôn hoặc không cho giảm
    if (item.quantity <= 1) {
      handleRemoveFromCart(item);
      return;
    }

    const newQuantity = item.quantity - 1;

    await axios.put("/cart/update", { 
      cartItemId: item.cartItemId, 
      quantity: newQuantity 
    });

    await refreshCart();
  } catch (error) {
    toast.error("không thể giảm số lượng");
  }
};

// Cart.jsx
const handleRemoveFromCart = async (product) => {
  try {
    // 2. Gọi hàm xóa từ Context (Hàm này sẽ gọi API)
    await removeFromCart(product.id); 
  
    toast.success(`Đã xóa ${product.name} khỏi giỏ hàng`);
  } catch (error) {
    // Nếu lỗi thì load lại dữ liệu để đảm bảo tính đúng đắn
    refreshCart(); 
    toast.error("Không thể xóa sản phẩm");
  }
};

  const handleCheckout = async (shippingAddress, paymentMethod) => {
    try {
      if (!cartItems || cartItems.length === 0) {
        toast.warning("Giỏ hàng của bạn đang trống!");
        return;
      }
      
      // Tạo Request Body đẩy lên Backend theo đúng DTO
      const cartItemIds = cartItems.map(item => item.cartItemId);
      const checkoutPayload = {
        cartItemIds,
        shippingAddress,
        paymentMethod
      };
      
      // Gọi lên Backend tạo Order
      const response = await axios.post("/orders/checkout", checkoutPayload);
      
      // Dọn giỏ hàng ở Frontend
      clearCart();
      setCartItems([]);
      setShowModal(false);
      
      // Nhận kết quả từ Backend
      const responseData = response.data;
      
      if (responseData === "ORDER_SUCCESS") {
        toast.success("Đặt hàng COD thành công! Cảm ơn bạn.");
      } 
      // Kiểm tra xem phản hồi có phải là URL VNPay ko (chữ bắt đầu bằng http)
      else if (typeof responseData === 'string' && responseData.startsWith("http")) {
        toast.info("Đang chuyển hướng sang trang thanh toán VNPay...");
        
        // CHUYỂN HƯỚNG THỰC TẾ (Sandbox)
        // Lệnh này bắt buộc browser bay sang VNPay để nhập form thẻ
        window.location.href = responseData;
      }
    } catch (error) {
      console.error("error during checkout", error);
      toast.error(error?.response?.data || "Quá trình thanh toán gặp sự cố!");
    }
  };

  const isCartValid = cartItems.every(item => item.quantity <= item.stockQuantity) && cartItems.length > 0;
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-gray-800">
          
          {/* Header */}
          <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-6 dark:border-gray-700 dark:bg-gray-800/50">
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Giỏ hàng của bạn</h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <i className="bi bi-cart-x text-4xl text-gray-400 dark:text-gray-500"></i>
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Giỏ hàng đang trống</h2>
              <p className="mb-6 text-gray-500 dark:text-gray-400">Bạn chưa chọn sản phẩm nào để mua.</p>
              <Link to="/" className="rounded-full bg-blue-600 px-8 py-3 font-bold text-white shadow-md transition-colors hover:bg-blue-700">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Product List */}
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex flex-col items-center p-6 transition-colors hover:bg-gray-50 sm:flex-row sm:p-8 dark:hover:bg-gray-700/30">
                    
                    {/* Image */}
                    <div className="h-24 w-24 flex-shrink-0 animate-fade-in rounded-2xl bg-gray-100 p-2 dark:bg-gray-700">
                      <Link to={`/product/${item.id}`}>
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                      </Link>
                    </div>

                    {/* Info */}
                    <div className="mt-4 flex-1 text-center sm:mt-0 sm:ml-6 sm:text-left">
                      <p className="mb-1 text-xs font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">{item.brand}</p>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
                      {item.quantity > item.stockQuantity && (
                        <div className="mt-2 rounded-lg bg-red-50 p-2 text-sm font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <i className="bi bi-exclamation-circle-fill mr-2"></i>
                            {item.stockQuantity === 0 
                                ? "Sản phẩm đã cháy hàng! Vui lòng xóa khối giỏ." 
                                : `Kho cập nhật trễ: Hiện chỉ còn ${item.stockQuantity} cái!`}
                        </div>
                      )}
                    </div>

                    {/* Quantity Control */}
                    <div className="mt-4 flex items-center rounded-full border border-gray-200 p-1 sm:mt-0 sm:ml-6 dark:border-gray-700">
                      <button onClick={() => handleDecreaseQuantity(item.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                        <i className="bi bi-dash font-bold"></i>
                      </button>
                      <span className="w-10 text-center font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                      <button onClick={() => handleIncreaseQuantity(item.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                        <i className="bi bi-plus font-bold"></i>
                      </button>
                    </div>

                    {/* Price */}
                    <div className="mt-4 w-32 text-center sm:mt-0 sm:ml-8 sm:text-right">
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        {(item.price * item.quantity).toLocaleString("vi-VN")} <span className="text-xs font-bold text-gray-500">VND</span>
                      </p>
                    </div>

                    {/* Remove Action */}
                    <div className="mt-4 sm:mt-0 sm:ml-4">
                      <button onClick={() => handleRemoveFromCart(item)} className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 transition-colors hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/40" title="Xóa">
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Footer / Checkout */}
              <div className="border-t border-gray-100 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800/80">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                  <div className="text-center sm:text-left">
                    <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Tổng tiền thanh toán</p>
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                      {totalPrice.toLocaleString("vi-VN")} <span className="text-lg font-bold text-gray-500">VND</span>
                    </p>
                  </div>
                    <button onClick={() => setShowModal(true)} className={`w-full rounded-full bg-blue-600 px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95 sm:w-auto
                  ${!isCartValid ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl active:scale-95'}`}>
                    Thanh Toán Ngay <i className="bi bi-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CheckoutPopup
        show={showModal}
        handleClose={() => setShowModal(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        handleCheckout={handleCheckout}
      />
    </div>
  );
};

export default Cart;