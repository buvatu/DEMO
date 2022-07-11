package com.quanlyduongsat.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.FuelOrderInfo;

@Repository
public interface FuelOrderInfoRepository extends JpaRepository<FuelOrderInfo, Long> {

    @Query("select count(foi) from FuelOrderInfo foi where foi.status = 'completed' and foi.fuelOrderType = :fuelOrderType and foi.companyID = :companyID and foi.approveDate between :startDate and :endDate")
    long getOrderNumber(@Param("fuelOrderType") String fuelOrderType, @Param("companyID") String companyID, @Param("startDate") Date startDate, @Param("endDate") Date endDate);

    List<FuelOrderInfo> findByRequestor(String requestor);

    List<FuelOrderInfo> findByTester(String tester);

    List<FuelOrderInfo> findByApprover(String approver);

    @Query("select foi from FuelOrderInfo foi where foi.status = 'completed' and foi.companyID = :companyID and foi.approveDate between :startDate and :endDate")
    List<FuelOrderInfo> getFuelOrderInfoList(@Param("companyID") String companyID, @Param("startDate") Date startDate, @Param("endDate") Date endDate);

    @Query("select foi from FuelOrderInfo foi where foi.fuelOrderType = 'O' and foi.status = 'completed' and foi.companyID = :companyID and foi.approveDate between :startDate and :endDate")
    List<FuelOrderInfo> getStockOutFuelOrderInfoList(@Param("companyID") String companyID, @Param("startDate") Date startDate, @Param("endDate") Date endDate);

    @Query("select foi from FuelOrderInfo foi where foi.fuelOrderType = 'I' and foi.status = 'completed' and foi.companyID = :companyID and foi.approveDate between :startDate and :endDate")
    List<FuelOrderInfo> getStockInFuelOrderInfoList(@Param("companyID") String companyID, @Param("startDate") Date startDate, @Param("endDate") Date endDate);

    @Query("select foi from FuelOrderInfo foi where foi.status = 'completed' and foi.companyID = :companyID and foi.approveDate between :startDate and :endDate")
    List<FuelOrderInfo> getCompletedFuelOrderInfoList(@Param("companyID") String companyID, @Param("startDate") Date startDate, @Param("endDate") Date endDate);

}
