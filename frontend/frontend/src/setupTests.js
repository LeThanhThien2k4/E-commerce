import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Thêm các mocks toàn cục nếu cần thiết
// Ví dụ: Mocking window.matchMedia hoặc các API trình duyệt không có trong jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
