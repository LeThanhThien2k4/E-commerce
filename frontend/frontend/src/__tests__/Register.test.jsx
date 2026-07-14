import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Register from '../components/Register';
import { BrowserRouter } from 'react-router-dom';
import axios from '../axios';

// Mock dependencies
vi.mock('../axios');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
};

// Hàm tiện ích để điền đầy đủ các trường bắt buộc
const fillAllFields = async (user, overrides = {}) => {
  const fields = {
    fullName: 'Nguyen Van A',
    email: 'a@gmail.com',
    username: 'vana',
    password: 'password123',
    confirmPassword: 'password123',
    ...overrides
  };

  if (fields.fullName) await user.type(screen.getByPlaceholderText(/Nhập họ và tên/i), fields.fullName);
  if (fields.email) await user.type(screen.getByPlaceholderText(/example@gmail.com/i), fields.email);
  if (fields.username) await user.type(screen.getByPlaceholderText(/VD: nguyenvan_a/i), fields.username);
  await user.type(screen.getByTestId('reg-password'), fields.password);
  await user.type(screen.getByTestId('reg-confirm-password'), fields.confirmPassword);
};

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nên hiển thị đầy đủ các trường nhập liệu', () => {
    renderRegister();
    expect(screen.getByPlaceholderText(/Nhập họ và tên/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/example@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/VD: nguyenvan_a/i)).toBeInTheDocument();
  });

  it('nên báo lỗi khi mật khẩu xác nhận không khớp', async () => {
    const user = userEvent.setup();
    renderRegister();

    // Phải điền đầy đủ các trường REQUIRED thì form mới submit được
    await fillAllFields(user, { confirmPassword: 'different' });
    
    const submitBtn = screen.getByRole('button', { name: /Xác Nhận Đăng Ký/i });
    await user.click(submitBtn);

    const errorMsg = await screen.findByTestId('error-message');
    expect(errorMsg).toHaveTextContent(/Mật khẩu xác nhận không khớp!/i);
  });

  it('nên gọi API register và chuyển hướng khi đăng ký thành công', async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValue({ data: 'Success' });
    renderRegister();

    await fillAllFields(user);

    await user.click(screen.getByRole('button', { name: /Xác Nhận Đăng Ký/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('nên hiển thị trạng thái loading khi đang xử lý', async () => {
    const user = userEvent.setup();
    axios.post.mockReturnValue(new Promise(() => {})); // Treo API
    renderRegister();

    await fillAllFields(user);

    await user.click(screen.getByRole('button', { name: /Xác Nhận Đăng Ký/i }));

    expect(screen.getByText(/Đang xử lý/i)).toBeInTheDocument();
  });
});
