package com.ThienLe.ecom_project.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {
    @Query("SELECT p from Product p WHERE "+
    "LOWER(p.name) LIKE LOWER(CONCAT('%',:keyword,'%')) OR " +
    "LOWER(p.description) LIKE LOWER(CONCAT('%',:keyword,'%')) OR " +
    "LOWER(p.brand) LIKE LOWER(CONCAT('%',:keyword,'%')) OR " +
    "LOWER(p.category) LIKE LOWER(CONCAT('%',:keyword,'%'))")
    List<Product> searchProducts(String keyword);
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.specifications WHERE p.id = :id")
    Optional<Product> findProductWithSpecs(@Param("id") Long id);
}
