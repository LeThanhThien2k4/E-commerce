package com.ThienLe.ecom_project.product;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "product_specifications")
public class ProductSpecification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore // Tránh vòng lặp vô hạn khi xuất JSON
    private Product product;

    @Column(name = "spec_key", nullable = false)
    private String specKey; // Ví dụ: "Màn hình", "CPU", "Pin", "Hệ điều hành"

    @Column(name = "spec_value", nullable = false, columnDefinition = "TEXT")
    private String specValue; // Ví dụ: "6.7 inch, Super Retina XDR", "A18 Pro", "4422 mAh"
    
    private String groupName; // (Tùy chọn) Để gom nhóm: "Màn hình", "Bộ vi xử lý", "Tiện ích"
}