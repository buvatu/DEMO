package com.demo.management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.demo.management.model.Standard;

@Repository
public interface StandardRepository extends JpaRepository<Standard, Long> {

    @Query("select id, standard_name from standards WHERE standard_name like %:standardName%")
    List<Standard> findByStandardNameLike(@Param("standardName") String standardName);

}
