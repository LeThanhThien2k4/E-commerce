import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from '../components/Login';
import { BrowserRouter } from 'react-router-dom';
import AppContext from '../context/Context';
import axios from '../axios';

// Mocking dependencies
vi.mock('../axios');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockContextValue = {
  fetchCurrentUser: vi.fn(),
  refreshCart: vi.fn(),
};

const renderLogin = () => {
  return render(
    <AppContext.Provider value={mockContextValue}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AppContext.Provider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it(' nên hiển thị đủ các trường nhập liệu và nút đăng nhập', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Nhập tên đăng nhập')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng Nhập Ngay/i })).toBeInTheDocument();
  });

  it('nên gọi API login và chuyển hướng khi đăng nhập thành công', async () => {
    axios.post.mockResolvedValue({ data: 'fake-token' });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Nhập tên đăng nhập'), { target: { value: 'user1' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Đăng Nhập Ngay/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:8080/login', {
        username: 'user1',
        password: 'password123',
      });
      expect(localStorage.getItem('token')).toBe('fake-token');
      expect(mockContextValue.fetchCurrentUser).toHaveBeenCalled();
      expect(mockContextValue.refreshCart).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('nên hiển thị thông báo lỗi khi đăng nhập thất bại', async () => {
    axios.post.mockRejectedValue(new Error('Unauthorized'));
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Nhập tên đăng nhập'), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Đăng Nhập Ngay/i }));

    await waitFor(() => {
      expect(screen.getByText('Tên đăng nhập hoặc mật khẩu không chính xác.')).toBeInTheDocument();
    });
  });

  it('nên yêu cầu nhập các trường bắt buộc', () => {
    renderLogin();
    const usernameInput = screen.getByPlaceholderText('Nhập tên đăng nhập');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});
