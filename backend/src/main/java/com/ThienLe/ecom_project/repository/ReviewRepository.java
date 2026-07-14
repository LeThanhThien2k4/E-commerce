package com.ThienLe.ecom_project.repository;

import com.ThienLe.ecom_project.product.Product;
import com.ThienLe.ecom_project.review.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Lấy danh sách đánh giá của 1 sản phẩm, sắp xếp theo thời gian mới nhất
    List<Review> findByProductOrderByCreatedAtDesc(Product product);
}