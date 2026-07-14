import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Home from '../components/Home';
import { BrowserRouter } from 'react-router-dom';
import AppContext from '../context/Context';
import axios from '../axios';

// Mock dependencies
vi.mock('../axios');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const getMockProducts = () => [
  { id: 1, name: 'Product 1', brand: 'Brand A', price: 100, category: 'Tech', available: true },
  { id: 2, name: 'Product 2', brand: 'Brand B', price: 200, category: 'Office', available: true },
];

const getContextValue = () => ({
  data: getMockProducts(),
  isError: '',
  addToCart: vi.fn(),
  refreshData: vi.fn(),
});

const renderHome = (props = {}, contextValue = getContextValue()) => {
  return render(
    <AppContext.Provider value={contextValue}>
      <BrowserRouter>
        <Home selectedCategory="" onClearCategory={vi.fn()} {...props} />
      </BrowserRouter>
    </AppContext.Provider>
  );
};

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation((url) => {
        if (url.includes('/image')) return Promise.resolve({ data: new Blob() });
        if (url.includes('/reviews')) return Promise.resolve({ data: [] });
        return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('nên gọi refreshData khi mount', async () => {
    const context = getContextValue();
    renderHome({}, context);
    await waitFor(() => {
      expect(context.refreshData).toHaveBeenCalled();
    });
  });

  it('nên hiển thị danh sách sản phẩm', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText('PRODUCT 1')).toBeInTheDocument();
      expect(screen.getByText('PRODUCT 2')).toBeInTheDocument();
    });
  });

  it('nên lọc sản phẩm theo category khi nhận prop selectedCategory', async () => {
    renderHome({ selectedCategory: 'Tech' });
    await waitFor(() => {
      expect(screen.getByText('PRODUCT 1')).toBeInTheDocument();
      expect(screen.queryByText('PRODUCT 2')).not.toBeInTheDocument();
    });
  });

  it('nên hiển thị thông báo "Không có sản phẩm" khi mảng sản phẩm trống', async () => {
    const emptyContext = { ...getContextValue(), data: [] };
    renderHome({}, emptyContext);
    await waitFor(() => {
        // Home.jsx lines 132-136
        expect(screen.getByText('Không có sản phẩm nào')).toBeInTheDocument();
    });
  });

  it('nên gọi addToCart khi bấm nút thêm vào giỏ', async () => {
    const context = getContextValue();
    context.addToCart.mockResolvedValue({ success: true });
    renderHome({}, context);
    
    await waitFor(() => {
      const addBtns = screen.getAllByTitle('Thêm vào giỏ');
      fireEvent.click(addBtns[0]);
    });

    expect(context.addToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });
});
