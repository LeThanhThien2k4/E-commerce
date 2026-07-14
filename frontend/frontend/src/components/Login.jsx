import React, { useContext, useState } from 'react';
import axios from "../axios";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AppContext from "../context/Context";
const Login = () => {
  const { fetchCurrentUser, refreshCart } = useContext(AppContext);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/login", credentials);
      const token = response.data; 
      
      if (token) {
        localStorage.setItem("token", token);
        
        // Lấy thông tin user và role ngay sau khi đăng nhập
        await fetchCurrentUser();
        await refreshCart();
        
        toast.success("Đăng nhập thành công!");
        navigate("/", { replace: true }); 
      }
    } catch (err) {
      setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 px-4 pt-28 pb-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-2xl dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            ĐĂNG NHẬP
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Chào mừng bạn quay lại hệ thống
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/30">
              <div className="flex text-red-500">
                <i className="bi bi-exclamation-triangle-fill mr-3"></i>
                <h3 className="text-sm font-bold">{error}</h3>
              </div>
            </div>
          )}

          <div className="space-y-5">
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
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                required
                className="block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 ring-1 ring-inset ring-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700/50 dark:text-white dark:ring-gray-600 dark:focus:bg-gray-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold tracking-wide text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Đăng Nhập Ngay
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Chưa có tài khoản?{" "}
            <a href="/register" className="font-bold text-blue-600 transition-colors hover:text-blue-500 hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;