package com.quanlyduongsat.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.Material;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    List<Material> findAllByOrderByMaterialIDAsc();

    @Query("select m from Material m where m.materialTypeID = '1527'")
    List<Material> findAllScrapMaterialList();

    Optional<Material> findByMaterialID(String materialID);

    @Query(value = "select m.material_id as \"materialID\", m.material_name as \"materialName\", m.unit, m.material_type_id as \"materialTypeID\", m.material_type_name as \"materialTypeName\", m.material_group_id as \"materialGroupID\", m.material_group_name as \"materialGroupName\", m.minimum_quantity as \"minimumQuantity\", s.quantity as \"stockQuantity\" from qlds.material m full join qlds.stock s on m.material_id = s.material_id where s.company_id=:companyID or s.company_id is null", nativeQuery = true)
    List<Map<String, Object>> getMaterialListWithStockQuantity(@Param("companyID") String companyID);

    @Query(value = "select m.material_id as \"materialID\", m.material_name as \"materialName\", m.unit, m.material_type_id as \"materialTypeID\", m.material_type_name as \"materialTypeName\", m.material_group_id as \"materialGroupID\", m.material_group_name as \"materialGroupName\", m.minimum_quantity as \"minimumQuantity\", s.quantity as \"stockQuantity\" from qlds.stock s join qlds.material m on s.material_id = m.material_id where s.company_id=:companyID", nativeQuery = true)
    List<Map<String, Object>> getMaterialListInStock(@Param("companyID") String companyID);

}
