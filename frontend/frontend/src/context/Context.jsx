import axios from "../axios";
import { useState, useEffect, createContext } from "react";
import { useCallback } from "react";
import { toast } from 'react-toastify';
const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],
  currentUser: null,
  addToCart: (product) => {},
  removeFromCart: (productId) => {},
  refreshData: () => {},
  refreshCart: () => {},
  clearCart: () => {},
  fetchCurrentUser: () => {},
  logout: () => {},
});

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined); // undefined = đang tải, null = chưa đăng nhập, {...} = đã đăng nhập

  const getCleanToken = () => {
    let token = localStorage.getItem("token");
    if (token && token.startsWith('"') && token.endsWith('"')) {
      return token.slice(1, -1);
    }
    return token;
  };

  // Lấy thông tin user hiện tại từ API /auth/me
  const fetchCurrentUser = useCallback(async () => {
    const token = getCleanToken();
    if (!token) {
      setCurrentUser(null);
      return;
    }
    try {
      const response = await axios.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data); // { username, role }
    } catch (error) {
      console.error("Không lấy được thông tin user:", error);
      setCurrentUser(null);
    }
  }, []);
  const refreshCart = useCallback(async () => {
    const token = getCleanToken();
    if (!token) {
      setCart([]); // Nếu không có token thì giỏ hàng phải rỗng
      return;
    }
    try {
      const response = await axios.get("/cart",{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setCart(response.data);
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng từ server:", error);
    }
  }, []);

  // 2. Hàm Add to Cart đồng bộ Server
  const addToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, message: "Vui lòng đăng nhập!" };

    try {
      // Giả sử API nhận vào productId và quantity
      await axios.post("/cart/add", { productId: product.id, quantity: 1 });
      await refreshCart(); // Cập nhật lại state cart từ DB
      return { success: true };
    } catch (error) {
      return { success: false, message: "Không thể thêm vào giỏ hàng" };
    }
  };

// 3. Hàm Remove đồng bộ Server - Phiên bản chuẩn xác
const removeFromCart = useCallback(async (productId) => {
  // 1. Lấy token và loại bỏ dấu ngoặc kép thừa (nếu có) do lúc lưu bị dính
  let token = localStorage.getItem("token");
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1); 
  }

  if (!token) {
    toast.error("Vui lòng đăng nhập để thực hiện thao tác này!");
    return;
  }

 try {
    // 1. Phải là .delete
   await axios.delete(`/cart/remove/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }); 
    
    // 2. Cập nhật lại giỏ hàng trong Context ngay lập tức
    await refreshCart(); 
    
    // Không để toast ở đây để tránh trùng lặp
  } catch (error) {
    console.error(error);
    throw error; // BẮT BUỘC có dòng này để Cart.jsx nhận biết được là có lỗi
  }
}, [refreshCart]);
  
  
  const refreshData = async () => {
    try {
      const response = await axios.get("/products");
      setData(response.data);
    } catch (error) {
      setIsError(error.message);
    }
  };

  useEffect(() => {
    refreshData();
    refreshCart();
    fetchCurrentUser(); // Tự động lấy role khi app khởi động (nếu đã có token)
  }, []);

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        data,
        isError,
        cart,
        currentUser,      // { username, role } - dùng để kiểm tra phân quyền
        addToCart,
        removeFromCart,
        refreshData,
        refreshCart,
        fetchCurrentUser, // Gọi lại sau khi Login để cập nhật role
        clearCart,
        logout,           // Dùng thay cho clearCart + removeToken ở nhiều chỗ
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;