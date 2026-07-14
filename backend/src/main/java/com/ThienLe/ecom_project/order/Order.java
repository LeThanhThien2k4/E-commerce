package com.ThienLe.ecom_project.order;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.ThienLe.ecom_project.order.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;

    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String shippingAddress;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;
}
