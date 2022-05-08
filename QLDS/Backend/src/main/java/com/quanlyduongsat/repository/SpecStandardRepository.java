package com.quanlyduongsat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.quanlyduongsat.entity.SpecStandard;

public interface SpecStandardRepository extends JpaRepository<SpecStandard, Long> {

    @Modifying
    @Query("update SpecStandard ss set ss.status = 'D'  where ss.specID =:specID")
    void disableSpecStandardBySpecID(@Param("specID") String specID);

    List<SpecStandard> findBySpecID(String specID);

}
