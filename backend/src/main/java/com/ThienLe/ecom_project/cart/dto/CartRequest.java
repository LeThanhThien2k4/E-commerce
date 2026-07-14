package com.ThienLe.ecom_project.cart.dto;

import lombok.Data;

@Data
public class CartRequest {
    private Long productId;
    private int quantity;
}
