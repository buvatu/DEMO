package com.demo.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.demo.main.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query(value = "select * from shop.orders where status = :status and owner = :owner", nativeQuery = true)
    List<Order> findOrdersByUsernameAndStatus(@Param("status") String status, @Param("owner") String owner);

}
