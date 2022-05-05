package com.quanlyduongsat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.quanlyduongsat.entity.SpecStandard;

public interface SpecStandardRepository extends JpaRepository<SpecStandard, Long> {

    @Query("update SpecStandard ss set ss.status = 'D' where ss.specID =:specID")
    void disableSpecStandardBySpecID(String specID);
}
