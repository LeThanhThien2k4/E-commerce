package com.ThienLe.ecom_project.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder // Dùng Builder pattern để sau này map dữ liệu từ Entity sang DTO cho tiện
public class ProductResponseDto {
    private Long id;
    private String name;
    private String description;
    private String brand;
    private BigDecimal price;
    private String category;
    private Integer quantity; // Số lượng tồn kho
    private boolean isAvailable;
    private String imageName;
    // Lưu ý: Không mang trường byte[] imageData vào đây để tránh làm nặng bộ nhớ khi truyền dữ liệu giữa các module
}