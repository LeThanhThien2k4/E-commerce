import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AppProvider } from '../context/Context';
import AppContext from '../context/Context';
import axios from '../axios';
import React, { useContext } from 'react';

// Mock axios
vi.mock('../axios');

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Helper component to test context values
const TestComponent = () => {
  const context = useContext(AppContext);
  return (
    <div>
      <div data-testid="user">{context.currentUser ? context.currentUser.username : 'null'}</div>
      <button onClick={context.logout} data-testid="logout-btn">Logout</button>
    </div>
  );
};

describe('AppContext & AppProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('nên làm sạch token nếu có dấu ngoặc kép dư thừa (getCleanToken)', async () => {
    localStorage.setItem('token', '"clean-token"');
    axios.get.mockResolvedValue({ data: { username: 'testuser', role: 'USER' } });

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(() => {
      // fetchCurrentUser is called in useEffect
      expect(axios.get).toHaveBeenCalledWith('/auth/me', expect.objectContaining({
        headers: { Authorization: 'Bearer clean-token' }
      }));
      expect(screen.getByTestId('user').textContent).toBe('testuser');
    });
  });

  it('nên xóa thông tin user và giỏ hàng khi logout', async () => {
    localStorage.setItem('token', 'valid-token');
    axios.get.mockResolvedValue({ data: { username: 'testuser' } });

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('testuser');
    });

    const logoutBtn = screen.getByTestId('logout-btn');
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  it('nên xử lý lỗi trả về từ API /auth/me bằng cách đặt user về null', async () => {
    localStorage.setItem('token', 'invalid-token');
    axios.get.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });
});
