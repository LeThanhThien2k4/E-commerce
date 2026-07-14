package com.ThienLe.ecom_project.order;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;

    // CHUẨN MODULAR: Thay thế hoàn toàn liên kết cứng `@ManyToOne private Product product;`
    @Column(name = "product_id", nullable = false)
    private Long productId;

    private int quantity;

    private BigDecimal price; // giá tại thời điểm mua
}