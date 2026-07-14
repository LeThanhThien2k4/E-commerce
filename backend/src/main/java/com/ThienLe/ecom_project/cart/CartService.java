package com.ThienLe.ecom_project.cart; // Đưa về đúng package mô-đun cart

import com.ThienLe.ecom_project.cart.dto.CartItemDto;
import com.ThienLe.ecom_project.product.ProductService; // Inject Service của Product, không dùng Repo của họ
import com.ThienLe.ecom_project.product.dto.ProductResponseDto; // Dùng DTO từ product nếu cần lấy thông tin kho/giá
import com.ThienLe.ecom_project.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // CHUẨN MODULAR: Quản lý Inject sạch sẽ
@Transactional
public class CartService {

    private final CartRepo cartRepo;
    private final ProductService productService; // Giao tiếp qua Service lớp Product
    private final UserService userService;       // Phục vụ tìm ID qua username nếu cần

    // ================== API PHỤC VỤ CONTROLLER (FRONTEND) ==================

    // 1. Lấy danh sách giỏ hàng theo userId (nhận từ Controller sau khi phân tách JWT)
    public List<CartItem> getCartItems(Long userId) {
        return cartRepo.findByUserId(userId);
    }

    // 2. Thêm sản phẩm vào giỏ hàng bằng ID
    public void addCartItem(Long userId, Long productId, int quantity) {
        // CHUẨN MODULAR: Gọi ProductService để check xem sản phẩm tồn tại hay không, không dùng ProductRepo ở đây
        if (!productService.existsById(productId)) {
            throw new RuntimeException("Sản phẩm không tồn tại với ID: " + productId);
        }

        // Kiểm tra xem sản phẩm này đã có trong giỏ của User này chưa
        CartItem existingItem = cartRepo.findByUserIdAndProductId(userId, productId);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartRepo.save(existingItem);
        } else {
            // CHUẨN MODULAR: CartItem Entity mới bây giờ chỉ lưu userId và productId thuần túy
            CartItem newItem = new CartItem();
            newItem.setUserId(userId);
            newItem.setProductId(productId);
            newItem.setQuantity(quantity);
            cartRepo.save(newItem);
        }
    }
    
    // 3. Cập nhật số lượng item trong giỏ
    public void updateCartItemQuantity(Long cartItemId, int newQuantity) {
        CartItem item = cartRepo.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dòng giỏ hàng với ID: " + cartItemId));
        
        if (newQuantity < 1) {
            cartRepo.delete(item);
            return;
        }

        int currentQuantity = item.getQuantity();
        
        if (newQuantity < currentQuantity) {
            item.setQuantity(newQuantity);
            cartRepo.save(item);
        }
        // 👉 NHÁNH [CHỐT CHẶN THAM LAM]: Hỏi ProductService xem số kho của ProductId này còn đủ không
        else if (newQuantity > currentQuantity) {
            int availableStock = productService.getProductAvailableStock(item.getProductId());
            if (newQuantity > availableStock) {
                throw new RuntimeException("Ối, kho hiện tại chỉ còn lại " + availableStock + " sản phẩm thôi!");
            }
            item.setQuantity(newQuantity);
            cartRepo.save(item);
        }
    }

    // 4. Xóa một sản phẩm cụ thể khỏi giỏ hàng
    public void deleteCartItem(Long userId, Long productId) {
        CartItem item = cartRepo.findByUserIdAndProductId(userId, productId);
        if (item != null) {
            cartRepo.delete(item);
        } else {
            throw new RuntimeException("Không tìm thấy sản phẩm trong giỏ hàng...");
        }
    }

    // 5. Xóa sạch giỏ hàng của một User (Dùng khi nhấn Clear Cart ngoài Frontend)
    public void clearCart(Long userId) {
        cartRepo.deleteByUserId(userId);
    }

    // ================== INTER-MODULE INTERFACES (CUNG CẤP CHO ORDER MODULE) ==================

    // Hàm gọi từ OrderService để lấy dữ liệu đóng gói dạng DTO đi checkout đơn hàng
    @Transactional(readOnly = true)
    public List<CartItemDto> getCartItemsForCheckout(List<Long> cartItemIds) {
        List<CartItem> cartItems = cartRepo.findAllById(cartItemIds);
        
        return cartItems.stream().map(item -> {
            // Hỏi mô-đun Product lấy đơn giá tại thời điểm checkout để nạp vào DTO
            java.math.BigDecimal price = productService.getProductPrice(item.getProductId());
            
            return new CartItemDto(
                item.getId(),
                item.getProductId(),
                item.getQuantity(),
                price
            );
        }).collect(Collectors.toList());
    }

    // Hàm gọi từ OrderService để tự động clear các item đã đặt hàng thành công
    public void clearCartItems(List<Long> cartItemIds) {
        cartRepo.deleteAllById(cartItemIds);
    }
}