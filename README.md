Markdown

\# 🛒 E-Commerce Project (Monorepo)

Chào mừng bạn đến với dự án \*\*E-Commerce\*\*! Đây là một ứng dụng mua sắm trực tuyến (E-commerce) được xây dựng theo mô hình Full Stack sử dụng kiến trúc Monorepo để quản lý cả Frontend và Backend trong cùng một repository.

\---

\## 🛠️ Công nghệ sử dụng

* \*\*Frontend:\*\* ReactJS, TailwindCSS / Bootstrap (hoặc thư viện UI bạn dùng), Axios.
* \*\*Backend:\*\* Spring Boot (Java), Spring Security, Hibernate / JPA.
* \*\*Database:\*\* PostgreSQL.

\---

\## 📂 Cấu trúc thư mục dự án

\```text

E-commerce/

├── backend/          # Source code của Spring Boot (API)

└── frontend/         # Source code của ReactJS (UI)

🚀 Hướng dẫn cài đặt và chạy dự án (Local Setup)

Để chạy dự án này ở môi trường local, bạn hãy chắc chắn rằng máy tính đã được cài đặt sẵn:

Java SDK 17+

Node.js (Khuyên dùng bản LTS)

PostgreSQL

Bước 1: Clone dự án về máy

Mở terminal tại thư mục bạn muốn lưu trữ dự án và chạy lệnh sau:

Bash

git clone [https://github.com/LeThanhThien2k4/E-commerce.git](https://github.com/LeThanhThien2k4/E-commerce.git)

cd E-commerce

Bước 2: Thiết lập và chạy Backend (Spring Boot)

Di chuyển vào thư mục backend:

Bash

cd backend

Cấu hình Cơ sở dữ liệu (Database):

Tạo một Database trống trong PostgreSQL của bạn (ví dụ đặt tên là: ecommerce\_db).

Tìm file cấu hình cấu trúc database tại src/main/resources/application.properties (hoặc application.yml).

Cập nhật lại thông tin kết nối Database của bạn (username và password của PostgreSQL local):

Properties

spring.datasource.url=jdbc:postgresql://localhost:5432/ecommerce\_db

spring.datasource.username=YOUR\_POSTGRES\_USERNAME

spring.datasource.password=YOUR\_POSTGRES\_PASSWORD

\# Tùy chọn tự động tạo bảng (chọn update hoặc create)

spring.jpa.hibernate.ddl-auto=update

Khởi chạy ứng dụng Spring Boot:

Bạn có thể mở thư mục backend bằng các IDE như IntelliJ IDEA hoặc Eclipse và nhấn Run file Application chính.

Hoặc chạy trực tiếp bằng terminal/cmd thông qua Maven:

Bash

\# Trên Windows:

mvnw.cmd spring-boot:run

\# Trên Mac/Linux:

./mvnw spring-boot:run

Mặc định, Server backend sẽ khởi chạy tại: http://localhost:8080

Bước 3: Thiết lập và chạy Frontend (ReactJS)

Mở một cửa sổ terminal mới (đang ở thư mục gốc E-commerce) và thực hiện:

Di chuyển vào thư mục frontend:

Bash

cd frontend

Cài đặt các thư viện phụ thuộc (dependencies):

Bash

npm install

Khởi chạy ứng dụng ReactJS:

Bash

npm run dev

\# Hoặc nếu dự án dùng Create React App:

npm start

Mặc định, giao diện người dùng sẽ chạy tại: http://localhost:3000 (hoặc http://localhost:5173 nếu bạn dùng Vite).

🔒 Lưu ý quan trọng về bảo mật

Tuyệt đối không push mật khẩu database thực tế hoặc các API Key nhạy cảm (Stripe, Cloudinary, v.v.) lên GitHub.

Hãy luôn đưa các file cấu hình chứa thông tin nhạy cảm vào .gitignore.

👥 Tác giả

Lê Thanh Thiện - Full Stack Developer - GitHub Profile
