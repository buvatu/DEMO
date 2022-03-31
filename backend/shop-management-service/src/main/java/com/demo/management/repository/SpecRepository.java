package com.demo.management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.demo.management.model.Spec;

public interface SpecRepository extends JpaRepository<Spec, Long> {

    @Query("select id, spec_name from specs WHERE spec_name like %:specName%")
    List<Spec> findBySpecNameLike(@Param("specName") String specName);

}
