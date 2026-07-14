# E-Commerce Backend — Reference

## Configuration (`application.properties`)

| Key | Purpose |
|-----|---------|
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/ecom_project` |
| `spring.datasource.username` / `password` | DB credentials |
| `spring.jpa.hibernate.ddl-auto` | `update` (auto schema) |
| `spring.jpa.show-sql` | `true` |
| `app.jwt.secret` | Base64 HMAC signing key |
| `spring.security.user.name/password` | Default Spring Security user (coexists with JWT) |
| `vnpay.tmn-code` | VNPay terminal code |
| `vnpay.hash-secret` | VNPay HMAC secret |
| `vnpay.url` | VNPay payment URL |
| `vnpay.return-url` | Backend callback URL |

No Spring profiles or env-var overrides configured.

## Database Schema

```
users
  id, username, password, role (ADMIN|USER)

product
  id, name, description, brand, price, category, release_date,
  available, quantity, image_name, image_type, image_data, deleted

product_specifications
  id, product_id (FK), spec_key, spec_value, group_name

cart_item
  id, user_id, product_id, quantity          -- flat IDs, no JPA FK

orders
  id, user_id, total_price, order_status, payment_method,
  shipping_address, created_at

order_items
  id, order_id (FK), product_id, quantity, price

reviews
  id, product_id (FK), user_id (FK), rating, comment, created_at
```

### ER relationships

- **cart_item / order_items → product, users:** logical FK via flat IDs
- **order_items → orders:** JPA `@ManyToOne`
- **product_specifications → product:** JPA `@OneToMany`
- **reviews → product, users:** JPA `@ManyToOne`

## API Endpoints

### Auth & Users

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/register` | Public | `Users` JSON | `Users` |
| POST | `/login` | Public | `{ username, password }` | JWT string |
| GET | `/api/auth/me` | JWT | — | `{ username, role }` |
| GET | `/users` | JWT | — | `List<Users>` |
| POST | `/users` | JWT | `Users` JSON | `Users` |

### Products

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/products` | Public | List all |
| GET | `/api/product/{id}` | Public | With specifications |
| POST | `/api/product` | Public | Multipart: `Product` + `imageFile` |
| PUT | `/api/product/{id}` | Public | Multipart update |
| DELETE | `/api/product/{id}` | Public | Soft delete |
| GET | `/api/product/{id}/image` | Public | Raw image bytes |
| GET | `/api/products/search?keyword=` | Public | Search |

### Cart

| Method | Path | Auth | Request body |
|--------|------|------|--------------|
| GET | `/api/cart` | JWT | — |
| POST | `/api/cart/add` | JWT | `{ productId, quantity }` |
| PUT | `/api/cart/update` | JWT | `{ cartItemId, quantity }` |
| DELETE | `/api/cart/remove/{productId}` | JWT | — |
| DELETE | `/api/cart/clear` | JWT | — |

### Orders

| Method | Path | Auth | Request / params |
|--------|------|------|------------------|
| GET | `/api/orders` | JWT | User's orders |
| GET | `/api/orders/all` | JWT | All orders (no admin check) |
| POST | `/api/orders/checkout` | JWT | `CheckoutRequest` |
| POST | `/api/orders/create-vnpay-payment` | JWT | `amount`, `orderId` params |
| GET | `/api/orders/vnpay-return` | JWT* | VNPay callback params |

*`vnpay-return` likely should be public — currently requires JWT.

**CheckoutRequest:**
```json
{
  "cartItemIds": [1, 2],
  "shippingAddress": "123 Street",
  "paymentMethod": "COD"
}
```

`paymentMethod` values: `COD`, `VNPAY`, `MOMO`, `VISA`.

**Checkout responses:**
- COD: `"ORDER_SUCCESS"` string
- VNPAY: payment URL string (from `buildVnpayUrl`)

### Reviews

| Method | Path | Auth | Request |
|--------|------|------|---------|
| GET | `/api/reviews/product/{productId}` | JWT | — |
| POST | `/api/reviews` | JWT | `{ productId, rating, comment }` |

## DTOs

| Class | Package | Fields / purpose |
|-------|---------|------------------|
| `CartRequest` | cart.dto | `productId`, `quantity` |
| `CartUpdateRequest` | cart.dto | `cartItemId`, `quantity` |
| `CartItemDto` | cart.dto | `id`, `productId`, `quantity`, `price` — checkout handoff |
| `CheckoutRequest` | order.dto | `cartItemIds`, `shippingAddress`, `paymentMethod` |
| `ReviewRequest` | review.dto | `productId`, `rating`, `comment` |
| `ProductResponseDto` | product.dto | Defined but **unused** |

## Enums

```java
// com.ThienLe.ecom_project.enums.Role
ADMIN, USER

// com.ThienLe.ecom_project.order.OrderStatus
PENDING, PAID, CANCELLED

// com.ThienLe.ecom_project.order.PaymentMethod
COD, VNPAY, MOMO, VISA
```

## Key Service Methods (inter-module)

### UserService
- `findIdByUsername(String)` → `Long`
- `getCurrentUserId()` → `Long`
- `getCurrentUser()` → `Optional<Users>`
- `register(Users)`, `verify(Users)` → JWT

### CartService
- `getCartItemsForCheckout(List<Long> cartItemIds)` → `List<CartItemDto>`
- `clearCartItems(List<Long> cartItemIds)`

### ProductService
- `existsById(Long)`, `getProductPrice(Long)`, `getProductAvailableStock(Long)`
- `validateProductsStock(List<CartItemDto>)`
- `deductStockFromCart(List<CartItemDto>)`
- `deductStockFromOrder(Map<Long, Integer>)`

### OrderService
- `checkout(String username, CheckoutRequest)` → `Object`
- `handleVnpayReturn(String responseCode, Long orderId)`
- `getOrdersByUsername(String)`, `getAllOrdersForAdmin()`

## JWT Details

- Library: jjwt 0.12.5
- Algorithm: HMAC-SHA (key from Base64 `app.jwt.secret`)
- Claims: `sub` = username, `role` = role name
- Expiry: 24 hours
- Header: `Authorization: Bearer <token>`

## VNPay Integration

Two implementations coexist:

1. **VNPayService** — uses `VNPayConfig` from properties (preferred)
2. **OrderService.buildVnpayUrl()** — inline with hardcoded `vnp_TmnCode` / `vnp_HashSecret`

Return URL mismatch:
- `application.properties`: `http://localhost:8080/api/orders/vnpay-return`
- `buildVnpayUrl()`: `http://localhost:5173/payment-return`

Consolidate on one implementation when fixing payment flow.

## Maven Coordinates

```xml
<groupId>com.telusko</groupId>
<artifactId>spring-sec-demo</artifactId>
<version>0.0.1-SNAPSHOT</version>
```

Main class: `com.ThienLe.ecom_project.EcomProjectApplication`
