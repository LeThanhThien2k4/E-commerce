package com.ThienLe.ecom_project.review.dto;

import lombok.Data;


@Data
public class ReviewRequest {
    private Long productId;
    private int rating;
    private String comment;
}