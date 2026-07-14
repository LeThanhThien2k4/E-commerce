package com.ThienLe.ecom_project.product;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@SQLDelete(sql = "UPDATE product SET available = false WHERE id = ?")
@Where(clause = "available = true")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    private String brand;

    private BigDecimal price;

    private String category;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date releaseDate;

    private boolean available;

    private int quantity;

    private String imageName;
    private String imageType;
    @Lob
    private byte[] imageData;
    
    private boolean deleted = false;
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductSpecification> specifications;
}
