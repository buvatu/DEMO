package com.demo.main.repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.demo.main.entity.OrderDetail;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    // This upsert query does not work??? I don't know why?
//    @Query(value = "insert into shop.order_details(order_id, product_id, quantity, status, updated_timestamp, updated_user) values(:orderID, :productID, :quantity, :status, :updatedTimestamp, :updatedUser) on conflict on constraint order_product_unique do "+
//           "update set quantity = (quantity + :quantity), status = :status, updated_timestamp = :updatedTimestamp, updated_user = :updatedUser where order_id = :orderID and product_id =:productID", nativeQuery = true)
//    void upsertOrderDetails(@Param("orderID") Long orderID, @Param("productID") Long productID, @Param("quantity") Integer quantity, @Param("status") String status, @Param("updatedTimestamp") Date updatedTimestamp, @Param("updatedUser") String updatedUser);
    @Query(value = "select * from shop.order_details where order_id = :orderID and product_id =:productID", nativeQuery = true)
    Optional<OrderDetail> findOrderDetailByOrderIDAndProductID(@Param("orderID") Long orderID, @Param("productID") Long productID);

    // Never hard delete records from these tables
    @Query(value = "update shop.order_details set quantity = 0, status = 'canceled', updated_timestamp = :updatedTimestamp, updated_user = :updatedUser where id = :orderDetailID ", nativeQuery = true)
    void removeOrderDetail(@Param("orderDetailID") Long orderDetailID, @Param("updatedTimestamp") Date updatedTimestamp, @Param("updatedUser") String updatedUser);

    @Query(value = "select order_id from shop.order_details where id = :orderDetailID", nativeQuery = true)
    Integer getOrderIDByOrderDetailID(@Param("orderDetailID") Long orderDetailID);

    @Query(value = "select count(*) from shop.order_details where order_id = :orderID and status =:status", nativeQuery = true)
    Integer countNumberOfOrderDetails(@Param("orderID") Long orderID, @Param("status") String status);

    @Query(value = "select * from shop.order_details where order_id = :orderID", nativeQuery = true)
    List<OrderDetail> getOrderDetailsByOrderID(@Param("orderID") Long orderID);

}
