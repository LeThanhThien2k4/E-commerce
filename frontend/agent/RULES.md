---
name: project-rules
description: Các quy tắc chung về kỹ thuật, Git và Quản lý chất lượng mã nguồn cho toàn dự án.
---

# Project Coding Rules

Ngoài các quy tắc thiết kế giao diện (FE) trong `SKILL.md`, toàn bộ dự án tuân thủ các quy tắc chung sau đây:

## 1. Git & Quản lý phiên bản (Version Control)
- **Tên nhánh (Branch Naming):** 
  - Thêm tính năng: `feat/ten-tinh-nang`
  - Sửa lỗi: `fix/ten-loi`
  - Thử nghiệm/Cấu hình: `chore/cap-nhat-thu-vien`
- **Commit Messages:** Tuân theo Conventional Commits. (Ví dụ: `feat: add product cart page`, `fix: handle null quantity bug`).
- **Mở Pull Request (PR):** Bắt buộc tạo Pull Request cho mọi thay đổi. Không push trực tiếp lên nhánh `main` hoặc `develop`.

## 2. Tiêu chuẩn mã nguồn (Code Quality)
- **DRY (Don't Repeat Yourself):** Không sao chép đoạn code quá 2 lần. Nếu code được gọi đi gọi lại, hãy tách ra một file Helper/Util hoặc một Hook dung chung.
- **Naming Conventions (Quy tắc đặt tên):**
  - Biến và Hàm: Dùng `camelCase` (ví dụ: `fetchProductList`).
  - Tên File Component (React): Dùng `PascalCase` (ví dụ: `ProductCard.jsx`).
  - Hằng số: Dùng `UPPER_SNAKE_CASE` (ví dụ: `MAX_ITEMS_PER_PAGE`).
- **Linter & Formatter:** Code trước khi commit phải pass qua quá trình kiểm tra của `eslint` và được format bởi `prettier`.

## 3. Xử lý Lỗi (Error Handling)
- Bắt buộc phải có khối `try...catch` khi xử lý các function gọi API (Bất đồng bộ - Async/Await).
- Mọi thao tác thất bại đều phải hiển thị phản hồi/thông báo lỗi thân thiện cho người dùng trên UI (ví dụ, Toast Message), thay vì chỉ hiển thị `console.error`.
