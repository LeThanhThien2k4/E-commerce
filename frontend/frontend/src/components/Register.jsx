import React, { useState } from 'react';
import axios from "../axios";
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '',
    email: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    // Xóa lỗi đang hiển thị nếu người dùng bắt đầu gõ lại
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (credentials.password !== credentials.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (credentials.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      setIsLoading(true);
      // Tạo object payload bỏ đi phần confirmPassword không cần thiết cho Backend
      const payload = {
        username: credentials.username,
        password: credentials.password,
        email: credentials.email,
        fullName: credentials.fullName
      };

      // Giả định endpoint backend là /register
      await axios.post("http://localhost:8080/register", payload);
      
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login"); 
      
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đăng ký! Có thể Username/Email đã tồn tại.");
      console.error("Register error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 px-4 pt-28 pb-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="w-full max-w-lg space-y-8 rounded-3xl bg-white p-10 shadow-2xl dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            ĐĂNG KÝ TÀI KHOẢN
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Tạo tài khoản mới để bắt đầu mua sắm
          </p>
        </div>

        <form aria-label="register-form" onSubmit={handleRegister} className="mt-8 space-y-6">
          {error && (
            <div data-testid="error-message" className="rounded-xl bg-red-50 p-4 dark:bg-red-900/30">
              <div className="flex text-red-500">
                <i className="bi bi-exclamation-triangle-fill mr-3 mt-0.5"></i>
                <h3 className="text-sm font-bold">{error}</h3>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                Họ và Tên
              </label>
              <input
                type="text"
                name="fullName"
                onChange={handleChange}
                required
                className="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 ring-1 ring-inset ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700/50 dark:text-white dark:ring-gray-600 dark:focus:bg-gray-700"
                placeholder="Nhập họ và tên của bạn"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                required
                className="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 ring-1 ring-inset ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700/50 dark:text-white dark:ring-gray-600 dark:focus:bg-gray-700"
                placeholder="example@gmail.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="username"
                onChange={handleChange}
                required
                className="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 ring-1 ring-inset ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700/50 dark:text-white dark:ring-gray-600 dark:focus:bg-gray-700"
                placeholder="VD: nguyenvan_a"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                data-testid="reg-password"
                onChange={handleChange}
                required
                className="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 ring-1 ring-inset ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700/50 dark:text-white dark:ring-gray-600 dark:focus:bg-gray-700"
                placeholder="Từ 6 ký tự"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                Xác nhận Mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                data-testid="reg-confirm-password"
                onChange={handleChange}
                required
                className="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 ring-1 ring-inset ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700/50 dark:text-white dark:ring-gray-600 dark:focus:bg-gray-700"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold tracking-wide text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                "Xác Nhận Đăng Ký"
              )}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-bold text-blue-600 transition-colors hover:text-blue-500 hover:underline">
              Đăng nhập tại đây
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
