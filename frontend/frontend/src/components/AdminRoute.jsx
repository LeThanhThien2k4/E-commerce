import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AppContext from "../context/Context";

/**
 * AdminRoute - Route Guard bảo vệ khu vực Admin
 * - Nếu chưa đăng nhập (currentUser = null) → redirect về /login
 * - Nếu đã đăng nhập nhưng role != ADMIN → redirect về /
 * - Nếu là ADMIN → cho qua (render <Outlet />)
 */
const AdminRoute = () => {
  const { currentUser } = useContext(AppContext);

  // Còn đang fetch currentUser (chưa biết role) → Hiện loading
  if (currentUser === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập nhưng không phải ADMIN
  if (currentUser.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // ✅ Là ADMIN → cho vào
  return <Outlet />;
};

export default AdminRoute;
