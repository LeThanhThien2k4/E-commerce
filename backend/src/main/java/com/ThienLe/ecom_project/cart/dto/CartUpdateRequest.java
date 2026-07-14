package com.ThienLe.ecom_project.cart.dto;

import lombok.Data;

@Data
public class CartUpdateRequest {
    private Long cartItemId;
    private int quantity;
}
