package com.ThienLe.ecom_project.cart; // Đã nằm đúng package mô-đun cart

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cart_item") // Định nghĩa rõ tên bảng trong database
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // CHUẨN MODULAR: Thay thế `@ManyToOne private Users user`
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // CHUẨN MODULAR: Thay thế `@ManyToOne private Product product`
    @Column(name = "product_id", nullable = false)
    private Long productId;

    private int quantity;
    
    // Custom Constructor mới dựa trên ID phẳng để phục vụ hàm `addCartItem` trong CartService
    public CartItem(Long userId, Long productId, int quantity) {
        this.userId = userId;
        this.productId = productId;
        this.quantity = quantity;
    }
}