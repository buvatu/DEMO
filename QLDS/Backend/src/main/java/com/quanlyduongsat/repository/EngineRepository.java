package com.quanlyduongsat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.Engine;

@Repository
public interface EngineRepository extends JpaRepository<Engine, Long> {

}
