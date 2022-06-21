package com.quanlyduongsat.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.Stock;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByCompanyIDAndMaterialID(String companyID, String materialID);

}
