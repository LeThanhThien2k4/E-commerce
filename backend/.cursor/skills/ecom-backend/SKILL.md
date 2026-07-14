---
name: ecom-backend
description: >-
  Guides development on the ecom-project Spring Boot e-commerce backend (Java 21,
  JWT, MySQL, VNPay). Use when adding features, fixing bugs, refactoring modules,
  creating endpoints, or working on product/cart/order/user/auth/review/payment code
  in com.ThienLe.ecom_project.
---

# E-Commerce Backend (ecom-project)

Single-module Spring Boot 3.2.2 backend for an e-commerce platform. Base package: `com.ThienLe.ecom_project`. Frontend expected at `http://localhost:5173` (Vite/React).

## Quick Start

**Prerequisites:** MySQL on `localhost:3306`, database `ecom_project`.

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Build
.\mvnw.cmd clean package

# Tests (currently no active @Test methods)
.\mvnw.cmd test
```

**Config:** `src/main/resources/application.properties` — DB credentials, JWT secret, VNPay sandbox keys.

**Default port:** 8080.

## Project Layout

```
src/main/java/com/ThienLe/ecom_project/
├── EcomProjectApplication.java
├── auth/          JWTService, AuthController (/api/auth/me)
├── cart/          Cart entity, CartRepo, CartService, CartController, dto/
├── config/        JwtFilter, VNPayConfig
├── enums/         Role (ADMIN, USER)
├── order/         Order, OrderItem, OrderService, OrderController, dto/
├── payment/       VNPayService, VNPayUtil
├── product/       Product, ProductSpecification, ProductService, ProductController, dto/
├── repository/    ReviewRepository (legacy location)
├── review/        Review, ReviewService, ReviewController, dto/
├── security/      SecurityConfig
└── user/          Users, UserRepo, UserService, UserController, UserPrincipal
```

Each domain is a **feature package** with its own entity, repository, service, and controller.

## Modular Architecture (CHUẨN MODULAR)

The codebase is mid-refactor toward **loosely coupled modules**. Follow these rules for all new and refactored code:

### Cross-module communication

| Do | Don't |
|----|-------|
| Call other modules via their **Service** layer | Inject another module's **Repository** |
| Pass **flat IDs** (`userId`, `productId`) in entities | Use `@ManyToOne` to `Users`/`Product` in cart/order |
| Use **DTOs** for inter-module data transfer | Return or pass full JPA entities across modules |
| Expose narrow public methods on services (e.g. `findIdByUsername`, `getCartItemsForCheckout`) | Reach into internal module state |

**Example — Order checkout flow:**
1. `OrderService` gets `userId` via `UserService.findIdByUsername()`
2. Gets cart data via `CartService.getCartItemsForCheckout(cartItemIds)` → `List<CartItemDto>`
3. Validates stock via `ProductService.validateProductsStock()`
4. Creates order with flat `userId` / `productId`
5. Clears cart via `CartService.clearCartItems()`

### Entity coupling rules

| Module | JPA relations |
|--------|---------------|
| `cart`, `order` | Flat `Long userId`, `Long productId` only |
| `review` | Full `@ManyToOne` to `Product` and `Users` (legacy pattern) |
| `product` | `@OneToMany` to `ProductSpecification` |

### Dependency injection

**Preferred (newer code):**
```java
@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepo cartRepo;
    private final ProductService productService;
}
```

**Legacy (avoid in new code):** `@Autowired` field injection on controllers/services.

## Layer Responsibilities

```
Controller  →  HTTP mapping, Principal/username resolution, ResponseEntity
Service     →  Business logic, @Transactional, cross-module orchestration
Repository  →  JpaRepository queries only
Entity      →  JPA mapping, no business logic
dto/        →  Request/response and inter-module transfer objects
```

Controllers resolve the current user via:
- `Principal principal` → `principal.getName()` (username), or
- `UserService.getCurrentUserId()` / `getCurrentUser()`

## Tech Stack

| Component | Choice |
|-----------|--------|
| Java | 21 |
| Spring Boot | 3.2.2 |
| Build | Maven (`pom.xml`; artifact `spring-sec-demo`) |
| DB | MySQL + Spring Data JPA (`ddl-auto=update`) |
| Auth | Stateless JWT (jjwt 0.12.5), BCrypt strength 12 |
| Lombok | `@Data`, `@RequiredArgsConstructor`, `@Getter/@Setter` |
| Payments | VNPay sandbox |

**Not in project:** Spring Validation, MapStruct, OpenAPI, Flyway/Liquibase, global `@ControllerAdvice`.

## Security

### Public endpoints (no JWT)

```
OPTIONS /**
/login, /register
/api/products/**, /api/product/**
```

All other routes require `Authorization: Bearer <token>`.

### JWT flow

1. `POST /login` with `{ username, password }` → raw JWT string (24h expiry)
2. `JwtFilter` validates token, sets `SecurityContext`
3. `GET /api/auth/me` → `{ username, role }`

### Roles

Enum `Role`: `ADMIN`, `USER`. JWT stores role in claim `role`, but **no `@PreAuthorize` or role checks** exist yet. `UserPrincipal` always grants `"USER"` authority.

### CORS

Allowed origin: `http://localhost:5173`. Several controllers also use `@CrossOrigin`.

## API Conventions

- **No unified response envelope** — endpoints return entities, plain strings, or ad-hoc `Map.of(...)`.
- **Mixed path style:** `/api/products` (plural) vs `/api/product/{id}` (singular).
- **Errors:** Local try/catch in controllers; services throw `RuntimeException` / `IllegalArgumentException` with Vietnamese or English messages. No global handler.
- **Product images:** Multipart upload; stored as `byte[]` in DB; served at `GET /api/product/{id}/image`.

For the full endpoint list, see [reference.md](reference.md).

## Domain Modules

### Product
- CRUD with multipart image upload
- Soft delete: `@SQLDelete` + `@Where(available = true)`
- Search: name, description, brand, category
- Stock: `validateProductsStock()`, `deductStockFromCart()`, `deductStockFromOrder()`

### Cart
- Per-user items: `userId + productId + quantity`
- Stock ceiling enforced on quantity increase via `ProductService`

### Order
- Checkout from selected `cartItemIds` via `CheckoutRequest`
- Statuses: `PENDING`, `PAID`, `CANCELLED`
- Payment: `COD` (stock deducted immediately, status PAID), `VNPAY` (returns payment URL; stock on callback)
- Enums also include `MOMO`, `VISA` — not implemented

### Review
- GET by product (newest first), POST requires auth
- Rating 1–5 + comment; JPA-linked to Product and Users

### Payment (VNPay)
- `VNPayService` + `VNPayConfig` (reads `application.properties`)
- **Known issue:** `OrderService.buildVnpayUrl()` duplicates VNPay logic with **different hardcoded credentials** than `VNPayConfig`

## Naming Conventions

| Type | Pattern | Examples |
|------|---------|----------|
| Entity | PascalCase noun | `Product`, `CartItem`, `Users` |
| Repository | `*Repo` or `*Repository` (mixed) | `ProductRepo`, `OrderRepository` |
| Service | `*Service` | `CartService` |
| Controller | `*Controller` | `OrderController` |
| DTO | `*Request`, `*Dto`, `*ResponseDto` | `CheckoutRequest`, `CartItemDto` |
| Package | lowercase singular | `product`, `cart`, `order` |

Comments mix Vietnamese and English; preserve existing language in touched code.

## Adding a New Feature — Checklist

```
Task Progress:
- [ ] Create or extend feature package under com.ThienLe.ecom_project
- [ ] Entity with flat IDs if cross-module (cart/order pattern)
- [ ] JpaRepository in same package (or document why in repository/)
- [ ] Service with @RequiredArgsConstructor + @Transactional
- [ ] Cross-module calls only via other Services, using DTOs
- [ ] Controller with @RequestMapping under /api/...
- [ ] Register public paths in SecurityConfig if unauthenticated access needed
- [ ] Update reference.md if adding endpoints
```

## Common Pitfalls

1. **`/api/orders/vnpay-return`** requires auth but VNPay browser redirect sends no JWT — likely needs `permitAll`.
2. **`/api/reviews/product/{id}`** requires auth though product pages typically need public reviews.
3. **Login JWT role** comes from request body `user.getRole()`, not DB — token role may be wrong/null.
4. **`/api/orders/all`** has no admin guard — any authenticated user can access.
5. **Secrets hardcoded** in `application.properties` — do not commit real production keys.
6. **ProductResponseDto** exists but is unused — prefer inline mapping or implement properly.
7. **Mixed `@Transactional` imports** — `jakarta.transaction` vs `org.springframework.transaction.annotation`.

## Testing

Only `EcomProjectApplicationTests.java` exists — misconfigured (`@SpringBootApplication` instead of `@SpringBootTest`), no `@Test` methods. When adding tests, use `@SpringBootTest`, `@AutoConfigureMockMvc`, and `spring-security-test` for JWT endpoints.

## Workflow: Typical Changes

### New REST endpoint
1. Read sibling controller/service in the same module
2. Add service method with business logic
3. Add controller mapping; use `Principal` or `UserService.getCurrentUserId()`
4. If public, add to `SecurityConfig.authorizeHttpRequests`

### New cross-module dependency
1. Add method to the **target module's Service** (not Repository)
2. Inject that Service via constructor in the calling Service
3. Transfer data via DTO, not entity references

### Product with image
Use `@RequestPart Product product, @RequestPart MultipartFile imageFile` — match `ProductController` pattern.

## Additional Resources

- Full API reference, entity schema, config keys: [reference.md](reference.md)
