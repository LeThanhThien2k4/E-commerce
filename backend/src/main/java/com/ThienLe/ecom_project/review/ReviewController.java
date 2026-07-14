package com.ThienLe.ecom_project.review;

import com.ThienLe.ecom_project.review.dto.ReviewRequest;
import com.ThienLe.ecom_project.user.Users;
import com.ThienLe.ecom_project.user.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final UserRepo userRepo;
    // GET: Lấy tất cả review của một sản phẩm (Không cần đăng nhập)
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }
    // POST: Gửi một review mới (Phải đăng nhập)
    @PostMapping
    public ResponseEntity<?> createReview(
            Principal principal,
            @RequestBody ReviewRequest request
    ) {
        String username = principal.getName();
        Users user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Review saved = reviewService.createReview(user, request);
        return ResponseEntity.ok(saved);
    }
}