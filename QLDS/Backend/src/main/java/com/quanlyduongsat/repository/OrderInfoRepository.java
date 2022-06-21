package com.quanlyduongsat.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.OrderInfo;

@Repository
public interface OrderInfoRepository extends JpaRepository<OrderInfo, Long> {

    @Query("select count(oi) from OrderInfo oi where oi.status = 'completed' and oi.orderType = :orderType and oi.companyID = :companyID and oi.approveDate between :startDate and :endDate")
    long getOrderNumber(@Param("orderType") String orderType, @Param("companyID") String companyID, @Param("startDate") Date startDate, @Param("endDate") Date endDate);

    List<OrderInfo> findByRequestor(String requestor);

    List<OrderInfo> findByTester(String tester);

    List<OrderInfo> findByApprover(String approver);

}
