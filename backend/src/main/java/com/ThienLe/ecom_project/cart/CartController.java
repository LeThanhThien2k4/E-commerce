package com.ThienLe.ecom_project.cart;

import com.ThienLe.ecom_project.cart.CartService;
import com.ThienLe.ecom_project.cart.dto.CartUpdateRequest;
import com.ThienLe.ecom_project.cart.dto.CartRequest;
import com.ThienLe.ecom_project.user.UserService; // Chỉ import UserService để nhận dạng người dùng
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor // CHUẨN MODULAR: Thay thế hoàn toàn cho @Autowired trên các field
@CrossOrigin
public class CartController {

    // CHUẨN MODULAR: Import đúng CartService nằm trong package com.thienle.ecom_project.cart
    private final CartService cartService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCartItems() {
        // CHUẨN MODULAR: Chỉ lấy ID phẳng của người dùng hiện tại
        Long currentUserId = userService.getCurrentUserId();
        return new ResponseEntity<>(cartService.getCartItems(currentUserId), HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<String> addCartItem(@RequestBody CartRequest request) {
        Long currentUserId = userService.getCurrentUserId();

        try {
            // Đẩy userId xuống, không đẩy cả cục Entity Users
            cartService.addCartItem(currentUserId, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok("Thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateCartItem(@RequestBody CartUpdateRequest request) {
        try {
            cartService.updateCartItemQuantity(request.getCartItemId(), request.getQuantity());
            return ResponseEntity.ok("Cập nhật số lượng thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<String> deleteCartItem(@PathVariable Long productId) {
        Long currentUserId = userService.getCurrentUserId();
        try {
            cartService.deleteCartItem(currentUserId, productId);
            return ResponseEntity.ok("Đã xóa");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCartItem() {
        Long currentUserId = userService.getCurrentUserId();
        
        // Khớp với hàm clearCart(Long userId) đã refactor ở CartService
        cartService.clearCart(currentUserId);
        return ResponseEntity.ok("Giỏ hàng trống");
    }
}