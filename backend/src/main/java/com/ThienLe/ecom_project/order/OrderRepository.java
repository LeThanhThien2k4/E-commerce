package com.ThienLe.ecom_project.order;

import com.ThienLe.ecom_project.user.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
List<Order> findByUserId(Long userId);}
