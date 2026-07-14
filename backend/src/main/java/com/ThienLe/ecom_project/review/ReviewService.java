package com.ThienLe.ecom_project.review;

import com.ThienLe.ecom_project.review.dto.ReviewRequest;
import com.ThienLe.ecom_project.product.Product;
import com.ThienLe.ecom_project.user.Users;
import com.ThienLe.ecom_project.product.ProductRepo;
import com.ThienLe.ecom_project.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepo productRepo;
    // Lấy danh sách review theo sản phẩm
    public List<Review> getReviewsByProductId(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + productId));
        return reviewRepository.findByProductOrderByCreatedAtDesc(product);
    }
    // Gửi review mới
    public Review createReview(Users user, ReviewRequest request) {
        // Validate
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Số sao phải từ 1 đến 5!");
        }
        Product product = productRepo.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!"));
        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return reviewRepository.save(review);
    }
}