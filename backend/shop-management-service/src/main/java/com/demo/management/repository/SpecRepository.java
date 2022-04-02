package com.demo.management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.demo.management.entity.Spec;

public interface SpecRepository extends JpaRepository<Spec, Long> {

    // To ensure the query run ok, we should add schema name to query
    @Query(value = "select id, spec_name, updated_timestamp, updated_user from shop.specs where spec_name like %:specName%", nativeQuery = true)
    List<Spec> findBySpecNameLike(@Param("specName") String specName);

}
