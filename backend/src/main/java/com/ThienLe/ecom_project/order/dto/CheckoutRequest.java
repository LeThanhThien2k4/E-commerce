package com.ThienLe.ecom_project.order.dto;

import com.ThienLe.ecom_project.order.PaymentMethod;
import lombok.Data;

import java.util.List;

@Data
public class CheckoutRequest {
    private List<Long> cartItemIds;
    private String shippingAddress;
    private PaymentMethod paymentMethod;
}