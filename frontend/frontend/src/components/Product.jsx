import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../context/Context";
import axios from "../axios";
import { toast } from 'react-toastify';
const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData, currentUser } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // Để null ban đầu
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false); // Kiểm tra đã mua hàng chưa
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/product/${id}`);
        setProduct(response.data);
        
        if (response.data) {
          const imageResponse = await axios.get(
            `http://localhost:8080/api/product/${id}/image`,
            { responseType: "blob" }
          );
          setImageUrl(URL.createObjectURL(imageResponse.data));
        }

        // Lấy danh sách đánh giá
        try {
          const reviewRes = await axios.get(`http://localhost:8080/api/reviews/product/${id}`);
          setReviews(reviewRes.data);
        } catch (err) {
          console.error("Không lấy được danh sách đánh giá:", err);
          setReviews([]);
        }

        // Kiểm tra đăng nhập và lịch sử mua hàng
        const token = localStorage.getItem("token");
        if (token) {
          setIsLoggedIn(true);
          try {
            const ordersRes = await axios.get("http://localhost:8080/api/orders", {
              headers: { Authorization: `Bearer ${token}` }
            });
            // Kiểm tra xem có đơn hàng nào chứa đúng sản phẩm này không
            const purchased = ordersRes.data.some(order =>
              order.items && order.items.some(item => String(item.product?.id) === String(id))
            );
            setHasPurchased(purchased);
          } catch (err) {
            console.error("Không lấy được lịch sử mua hàng:", err);
          }
        }

      } catch (error) {
        console.error("Error fetching product or image:", error);
      }
    };

    fetchProduct();

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Gửi lên API Spring Boot (Cần Token trong Header nếu bạn dùng JWT)
      await axios.post(`http://localhost:8080/api/reviews`, {
        productId: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      toast.success("Cảm ơn bạn đã đánh giá!");
      setNewReview({ rating: 5, comment: "" });
      // Reload lại danh sách review
      const reviewRes = await axios.get(`http://localhost:8080/api/reviews/product/${id}`);
      setReviews(reviewRes.data);
    } catch (error) {
      toast.error("Không thể gửi đánh giá. Vui lòng kiểm tra đăng nhập!");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:8080/api/product/${id}`);
        removeFromCart(id);
        toast.success("Product deleted successfully");
        refreshData();
        navigate("/");
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

 const handleAddToCart = async (e, product) => {
  
    e.preventDefault(); 
    e.stopPropagation();
    
  const result = await addToCart(product); // Gọi hàm từ Context
  
    if (result.success) {
        toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
    } else {
      // Nếu lỗi do chưa đăng nhập
      if (result.message.includes("đăng nhập")) {
        toast.warning("Vui lòng đăng nhập để mua hàng!");
        navigate("/login");
      } else {
        toast.error(result.message);
      }
    }
};

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Đang tải thông tin sản phẩm...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-4 shadow-xl lg:p-8 dark:bg-gray-800">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 xl:gap-x-10">
            
            {/* Hình ảnh bên trái */}
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gray-100 p-8 dark:bg-gray-700 lg:aspect-auto lg:h-[600px]">
              <img
                src={imageUrl || "https://via.placeholder.com/400"}
                alt={product.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal"
              />
            </div>

            {/* Chi tiết bên phải */}
            <div className="mt-10 px-2 sm:px-0 lg:mt-0">
              <div className="mb-8 border-b border-gray-200 pb-8 dark:border-gray-700">
                <span className="text-sm font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
                  {product.category}
                </span>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                  {product.name}
                </h1>
                <p className="mt-2 text-lg italic text-gray-500 dark:text-gray-400">
                  ~ {product.brand}
                </p>
                <p className="mt-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  {product.description}
                </p>
              </div>

              <div className="flex flex-col gap-8 mb-8">
                {/* Khu vực giá */}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">
                    {product.price.toLocaleString("vi-VN")} 
                  </span>
                  <span className="text-xl font-bold text-gray-500">VND</span>
                </div>

                {/* Thông tin phụ */}
                <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                  <div>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Tồn kho</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {product.quantity} sản phẩm
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Ngày ra mắt</span>
                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {new Date(product.releaseDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Nút giỏ hàng */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.available}
                  className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 text-lg font-bold tracking-wide text-white transition-all duration-200 lg:w-3/4 ${
                    product.available
                      ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95"
                      : "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
                  }`}
                >
                  <i className="bi bi-cart3 text-2xl"></i>
                  {product.available ? "THÊM VÀO GIỎ HÀNG" : "ĐÃ HẾT HÀNG"}
                </button>
              </div>

              {/* Nút Sửa / Xóa - Chỉ hiển với ADMIN */}
              {currentUser?.role === "ADMIN" && (
                <div className="flex gap-4 border-t border-gray-200 pt-8 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/product/update/${id}`)}
                    className="flex items-center gap-2 rounded-lg border-2 border-indigo-600 px-6 py-2.5 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                  >
                    <i className="bi bi-pencil-square"></i>
                    CẬP NHẬT
                  </button>
                  <button
                    type="button"
                    onClick={deleteProduct}
                    className="flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600 shadow-md hover:shadow-lg"
                  >
                    <i className="bi bi-trash3"></i>
                    XÓA
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Phần hiển thị Thông số kỹ thuật */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Thông số kỹ thuật</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
              {product.specifications && product.specifications.length > 0 ? (
                <table className="w-full text-base text-left text-gray-500 border-collapse border border-gray-200 dark:text-gray-400 dark:border-gray-700">
                  <tbody>
                    {product.specifications.map((spec, index) => (
                      <tr key={index}>
                        <th scope="row" className="px-6 py-3 font-semibold text-gray-900 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 w-1/3">
                          {spec.specKey}
                        </th>
                        <td className="px-6 py-3 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                          {spec.specValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-4 italic">Chưa có thông số kỹ thuật cho sản phẩm này.</p>
              )}
            </div>
          </div>
          {/* --- SECTION: REVIEWS & COMMENTS --- */}
          <div className="mt-16 border-t border-gray-200 pt-10 dark:border-gray-700">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8">
              Đánh giá sản phẩm ({reviews.length})
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Khu vực viết đánh giá - Điều kiện: đã đăng nhập VÀ đã mua hàng */}
              <div className="lg:col-span-1">
                {!isLoggedIn ? (
                  // Khách chưa đăng nhập
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl text-center">
                    <i className="bi bi-lock text-3xl text-gray-400 mb-3 block"></i>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Vui lòng đăng nhập để xem có thể viết đánh giá không.</p>
                    <a href="/login" className="inline-block rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700">Đăng nhập</a>
                  </div>
                ) : hasPurchased ? (
                  // Đã mua hàng -> Hiện form đánh giá
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-2xl h-fit">
                    <h3 className="text-lg font-bold mb-4 dark:text-white">Viết đánh giá</h3>
                    <form onSubmit={handleReviewSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số sao</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="text-2xl transition-transform hover:scale-125"
                            >
                              {star <= newReview.rating ? (
                                <i className="bi bi-star-fill text-yellow-400"></i>
                              ) : (
                                <i className="bi bi-star text-gray-300"></i>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <textarea
                          required
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          rows="4"
                          placeholder="Chia sẻ trải nghiệm của bạn..."
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                      >
                        {submitting ? "ĐANG GỬI..." : "GỬI ĐÁNH GIÁ"}
                      </button>
                    </form>
                  </div>
                ) : (
                  // Đã đăng nhập nhưng CHƯA mua sản phẩm này
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-6 rounded-2xl text-center">
                    <i className="bi bi-bag-x text-3xl text-amber-500 mb-3 block"></i>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      Bạn cần <strong>mua sản phẩm này</strong> trước mới có thể viết đánh giá.
                    </p>
                  </div>
                )}
              </div>

              {/* Danh sách hiển thị Review - Chức năng đọc (mọi người đều xem được) */}
              <div className="lg:col-span-2 space-y-6">
                {reviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <i className="bi bi-chat-square-text text-4xl text-gray-300 mb-3"></i>
                    <p className="text-gray-500 italic dark:text-gray-400">Chưa có đánh giá nào cho sản phẩm này.</p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {/* Hiển thị chữ cái đầu của username */}
                          {rev.username ? rev.username.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold dark:text-white">{rev.username || `Người dùng #${rev.userId}`}</p>
                          <div className="flex text-yellow-400 text-xs mt-0.5">
                            {"\u2605".repeat(rev.rating)}{"\u2606".repeat(5 - rev.rating)}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-gray-400">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("vi-VN") : ""}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed ml-12">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;