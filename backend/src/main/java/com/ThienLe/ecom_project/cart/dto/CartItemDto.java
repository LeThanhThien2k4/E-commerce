package com.ThienLe.ecom_project.cart.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    private Long id;
    private Long productId;
    private Integer quantity;
    private BigDecimal price;
}