package com.quanlyduongsat.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.Price;

@Repository
public interface PriceRepository extends JpaRepository<Price, Long> {

    Optional<Price> findByMaterialIDAndCompanyIDAndAdjustTime(String materialID, String companyID, String adjustTime);

}
