package com.demo.main.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.demo.main.entity.Stock;

public interface StockRepository extends JpaRepository<Stock, Long> {

    @Query(value = "select quantity from shop.stocks where product_id = :productID", nativeQuery = true)
    Optional<Integer> findProductQuantity(@Param("productID") Long productID);

    @Query(value = "select * from shop.stocks where product_id = :productID", nativeQuery = true)
    Optional<Stock> findStockByProductID(@Param("productID") Long productID);

}
