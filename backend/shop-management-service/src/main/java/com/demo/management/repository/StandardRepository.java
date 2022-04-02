package com.demo.management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.demo.management.entity.Standard;

@Repository
public interface StandardRepository extends JpaRepository<Standard, Long> {

    @Query(value = "select id, standard_name, updated_timestamp, updated_user from shop.standards where standard_name like %:standardName%", nativeQuery = true)
    List<Standard> findByStandardNameLike(@Param("standardName") String standardName);

}
