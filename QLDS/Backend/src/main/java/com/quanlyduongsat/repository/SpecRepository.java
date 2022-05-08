package com.quanlyduongsat.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.quanlyduongsat.entity.Spec;

public interface SpecRepository extends JpaRepository<Spec, Long> {

    Optional<Spec> findBySpecID(String specID);

}
