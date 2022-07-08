package com.quanlyduongsat.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.Stock;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByCompanyIDAndMaterialID(String companyID, String materialID);

    List<Stock> findByCompanyIDAndStatus(String companyID, String status);

    @Query(value = "select m.material_id as \"materialID\", m.material_name as \"materialName\", m.unit, m.material_type_id as \"materialTypeID\", m.material_type_name as \"materialTypeName\", m.material_group_id as \"materialGroupID\", m.material_group_name as \"materialGroupName\", m.minimum_quantity as \"minimumQuantity\", s.quantity as \"stockQuantity\" from qlds.stock s join qlds.material m on s.material_id = m.material_id where s.status='A'", nativeQuery = true)
    List<Map<String, Object>> getActiveMaterialListInStock();

    @Modifying
    @Query(value= "update qlds.stock set status = 'N' where company_id=:companyID", nativeQuery = true)
    void disableStockByCompanyID(@Param("companyID") String companyID);

}
