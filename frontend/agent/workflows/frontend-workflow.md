---
description: Quy trình phát triển và hoàn thiện tính năng (Frontend feature development)
---

# Workflow: Triển khai một tính năng Frontend

Dưới đây là một quy trình làm việc (workflow) chuẩn từ khi bắt đầu ticket cho đến khi mở Pull Request trên dự án ReactJS:

1. **Nghiên cứu & Chuẩn bị (Research & Setup)**
   - Đọc hiểu kỹ yêu cầu tính năng (Business logic).
   - Kiểm tra `SKILL.md` để đảm bảo nắm rõ các định dạng và chuẩn thiết kế UI sẽ sử dụng.
   - Xác định những file/component nào cần tạo mới hay chỉnh sửa thêm.

2. **Xây dựng Giao diện (Build UI / Mocking)**
   - Viết hoặc chỉnh sửa cấu trúc của JSX/HTML.
   - Thêm class CSS hoặc styled component tương ứng. Không sử dụng CSS inline. Dùng TailWindCSS với các className
   - Dùng dữ liệu giả (Mock data) tĩnh để dựng UI hiển thị thành công trước khi cắm API vào mạch.

3. **Tích hợp Logic & Kết nối API (Integration)**
   - Viết các hàm call API (thường dùng axios hoặc qua redux/context nếu cần thiết).
   - Đấu nối dữ liệu lấy từ API vào state của giao diện.
   - Bổ sung các trạng thái thay thế (Loading Spinner, Skeleton) và bắt lỗi (Error states/Toast Messages) và cơ chế tự động thử lại (nếu có).

// turbo
4. **Kiểm tra và Định dạng lại Code (Format & Lint)**
   - Chạy lệnh để format và tìm lỗi syntax cục bộ:
   `npm run lint` hoặc `npm run format`

5. **Hoàn thiện & Mở Review (Pull Request)**
   - Tự review lại code của mình thông qua Git Diff. Soạn commit message rõ ràng.
   - Push code lên nhánh mới.
   - (Tùy chọn) Chụp ảnh màn hình đối với tính năng FE để đính kèm lên Pull Request nhằm giúp reviewer dễ nhìn nhận hơn.
