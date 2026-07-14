package com.ThienLe.ecom_project.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartRepo extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId); // Chỉ lấy hàng của user này
    void deleteByUserId(Long userId); // Chỉ xóa hàng của user này
    CartItem findByUserIdAndProductId(Long userId, Long productId);
}
