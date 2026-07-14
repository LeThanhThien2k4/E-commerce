import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Navbar from '../components/Navbar';
import { BrowserRouter } from 'react-router-dom';
import AppContext from '../context/Context';
import axios from '../axios';

// Mock dependencies
vi.mock('../axios');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
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

const defaultContextValue = {
  data: [],
  clearCart: vi.fn(),
  refreshCart: vi.fn(),
  currentUser: null,
  logout: vi.fn(),
};

const renderNavbar = (contextValue = defaultContextValue) => {
  return render(
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <Navbar onSelectCategory={vi.fn()} onSearch={vi.fn()} />
      </BrowserRouter>
    </AppContext.Provider>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('nên hiển thị nút Đăng nhập khi chưa đăng nhập', () => {
    renderNavbar();
    expect(screen.getByText('Đăng nhập')).toBeInTheDocument();
  });

  it('nên hiển thị nút Đăng xuất và Đơn hàng khi đã đăng nhập', () => {
    const loggedInValue = {
      ...defaultContextValue,
      currentUser: { username: 'testuser', role: 'USER' },
    };
    renderNavbar(loggedInValue);
    expect(screen.queryByText('Đăng nhập')).not.toBeInTheDocument();
    expect(screen.getByText('Đăng xuất')).toBeInTheDocument();
    expect(screen.getByText('Đơn hàng')).toBeInTheDocument();
  });

  it('nên hiển thị nút Admin khi user có quyền ADMIN', () => {
    const adminValue = {
      ...defaultContextValue,
      currentUser: { username: 'admin', role: 'ADMIN' },
    };
    renderNavbar(adminValue);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('không nên hiển thị nút Admin khi user có quyền USER', () => {
    const userValue = {
      ...defaultContextValue,
      currentUser: { username: 'user', role: 'USER' },
    };
    renderNavbar(userValue);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('nên chuyển đổi Theme khi bấm vào nút Theme', () => {
    renderNavbar();
    const themeBtn = screen.getByTestId('theme-toggle');
    // Mặc định là light-theme
    expect(localStorage.getItem('theme')).toBeNull(); // Hoặc default
    
    fireEvent.click(themeBtn);
    expect(localStorage.getItem('theme')).toBe('dark-theme');
    expect(document.body.className).toBe('dark-theme');

    fireEvent.click(themeBtn);
    expect(localStorage.getItem('theme')).toBe('light-theme');
    expect(document.body.className).toBe('light-theme');
  });

  it('nên gọi logout và chuyển về trang login khi bấm Đăng xuất', () => {
    const logoutMock = vi.fn();
    const loggedInValue = {
      ...defaultContextValue,
      currentUser: { username: 'testuser', role: 'USER' },
      logout: logoutMock,
    };
    renderNavbar(loggedInValue);
    
    // Lấy tất cả các nút logout (có thể có ở cả giao diện Desktop và Mobile)
    const logoutBtns = screen.getAllByTestId('logout-btn');
    fireEvent.click(logoutBtns[0]);
    
    expect(logoutMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
