package com.quanlyduongsat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.Material;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    List<Material> findAllByOrderByMaterialIDAsc();

    Optional<Material> findByMaterialID(String materialID);

}
