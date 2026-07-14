package com.ThienLe.ecom_project.review;

import com.ThienLe.ecom_project.product.Product;
import com.ThienLe.ecom_project.user.Users;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;


import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore // Tránh vòng lặp JSON
    private Product product;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // Tránh vòng lặp JSON
    private Users user;
    
    @Column(nullable = false)
    private int rating; // 1->5
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    // Virtual fields để trả về cho FE (không lưu DB)
    
    @Transient
    private Long userId;
    
    @Transient
    private String username;
    
    // Tự điền trước khi serialize JSON
    @PostLoad
    public void onLoad() {
        if (this.user != null) {
            this.userId = this.user.getId();
            this.username = this.user.getUsername();
        }
    }
}