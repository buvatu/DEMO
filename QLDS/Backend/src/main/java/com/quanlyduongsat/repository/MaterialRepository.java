package com.quanlyduongsat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.Material;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    List<Material> findAllByOrderByMaterialIDAsc();

    @Query("select m from Material m where m.materialTypeID = '1527'")
    List<Material> findAllScrapMaterialList();

    Optional<Material> findByMaterialID(String materialID);

}
