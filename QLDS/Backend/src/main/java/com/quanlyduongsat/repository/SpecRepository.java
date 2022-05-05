package com.quanlyduongsat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.quanlyduongsat.entity.Spec;

public interface SpecRepository extends JpaRepository<Spec, Long> {

    List<Spec> findByStatus(String status);

}
