package com.demo.main.repository;

import java.util.Date;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.demo.main.model.OrderDetails;

public interface OrderDetailsRepository extends JpaRepository<OrderDetails, Long> {

    @Query("insert into order_details(order_id, product_id, quantity, status, updated_timestamp, updated_user) values(:orderID, :productID, :quantity, :status, :updatedTimestamp, :updatedUser) on conflict on constraint order_product_unique do "+
           "update order_details set quantity = quantity + :quantity, status = :status, updated_timestamp = :updatedTimestamp, updated_user = :updatedUser ")
    void upsertOrderDetails(@Param("orderID") Long orderID, @Param("productID") Long productID, @Param("quantity") Integer quantity, @Param("status") String status, @Param("updatedTimestamp") Date updatedTimestamp, @Param("updatedUser") String updatedUser);

    // Never hard delete records from these tables
    @Query("update order_details set quantity = 0, status = 'canceled', updated_timestamp = :updatedTimestamp, updated_user = :updatedUser where id = :orderDetailID ")
    void removeOrderDetails(@Param("orderDetailID") Long orderDetailID, @Param("updatedTimestamp") Date updatedTimestamp, @Param("updatedUser") String updatedUser);

}
