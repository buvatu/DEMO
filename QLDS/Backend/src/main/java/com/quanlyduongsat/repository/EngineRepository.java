package com.quanlyduongsat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.Engine;

@Repository
public interface EngineRepository extends JpaRepository<Engine, Long> {

    List<Engine> findByCompanyID(String companyID);

}
