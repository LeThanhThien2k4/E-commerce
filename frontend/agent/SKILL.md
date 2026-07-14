---
name: fe-design-rules
description: Các quy tắc và hướng dẫn thiết kế, phát triển Frontend (UI/UX).
---

# Frontend Design Rules

Dưới đây là các quy tắc cốt lõi cần tuân thủ khi phát triển và thiết kế Frontend cho dự án này.

## 1. Công nghệ (Technology Stack)
- Sử dụng **React** làm thư viện chính để xây dựng giao diện.
- Ưu tiên sử dụng Functional Components và Hooks (thay vì Class Components).
- Quản lý trạng thái (State) hợp lý, ưu tiên state cục bộ trừ những state cần chia sẻ toàn cục (có thể dùng Context API hoặc Redux/Zustand nếu được yêu cầu).

## 2. Thẩm mỹ & Giao diện (Design & Aesthetics)
- **Thiết kế hiện đại và sang trọng**: Giao diện cần mang lại cảm giác cao cấp. Tránh xa lối thiết kế sơ sài, đơn điệu.
- **Màu sắc hài hòa**: Khuyến khích sử dụng các bảng màu được phối cẩn thận, cân nhắc sử dụng Dark Mode hoặc hỗ trợ chuyển đổi giao diện sáng/tối. Tránh dùng các màu cơ bản quá rực (ví dụ red, blue thuần) mà không có sự pha trộn tinh tế.
- **Typography hiện đại**: Sử dụng các font chữ hiện đại, rõ ràng như Inter, Roboto, hoặc Outfit thay vì font mặc định của trình duyệt.
- **Hoạt ảnh (Animations)**: Thêm các micro-animations (hoạt ảnh nhỏ, tinh tế) cho các thao tác của người dùng như hover vào nút bấm, chuyển đổi trang, hoặc mở modal để UI trở nên sống động.

## 3. Chống rập khuôn và Tránh component trống
- Không bao giờ thiết kế ra một trang trống trơn. Nếu cần dữ liệu, hãy tạm thời sử dụng Placeholder thích hợp hoặc sinh giả (mock) để có UI tương tác được.
- Đổi mới UI/UX để giúp nâng tầm trải nghiệm của dự án thương mại điện tử (e-commerce).

## 4. Tương thích môi trường và Responsive
- **Mobile First**: Luôn đảm bảo ứng dụng hiển thị tốt và hoạt động trơn tru trên mọi kích thước màn hình thiết bị di động trước, sau đó mới tính tới Desktop/Tablet.
- Tận dụng Flexbox hoặc CSS Grid để xây dựng bố cục (Layout), tránh cứng nhắc bằng cách fix `width` hoặc `height` pixel tuyệt đối ở các container lớn.

## 5. Tối ưu trải nghiệm Web (SEO & Accessibility)
- Khai báo đầy đủ các thẻ meta, title có tính mô tả ở mỗi trang.
- Sử dụng cấu trúc HTML semantic (thẻ `<header>`, `<main>`, `<article>`, `<nav>`, `<footer>`) để giúp các công cụ đọc màn hình và bộ máy tìm kiếm dễ dàng thu thập thông tin.
- Các nút tương tác cần có `id` hoặc `class` có tính gợi nhớ, rõ ràng. Kèm thuộc tính `alt` cho mọi thẻ `<img/>`.
