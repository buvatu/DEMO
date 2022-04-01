package com.demo.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.demo.main.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("select * from orders where status = :status and username = :username")
    List<Order> findOrdersByUsernameAndStatus(@Param("status") String status, @Param("username") String username);

}
