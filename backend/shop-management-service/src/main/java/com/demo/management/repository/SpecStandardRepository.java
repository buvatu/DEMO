package com.demo.management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.demo.management.model.SpecStandard;

public interface SpecStandardRepository extends JpaRepository<SpecStandard, Long> {

    @Query(value = "select id, spec_id, standard_id, standard_value from spec_standard where spec_id = :specID", nativeQuery = true)
    List<SpecStandard> findBySpecID(@Param("specID") Long specID);

    @Query(value = "delete from spec_standard where spec_id = :specID", nativeQuery = true)
    void deleteBySpecID(@Param("specID") Long specID);

}
