package com.quanlyduongsat.repository;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.Scrap;

@Repository
public interface ScrapRepository extends JpaRepository<Scrap, Long> {

    List<Scrap> findAllByOrderByMaterialNameAsc();

    @Query(value= "select * from qlds.scrap_price where company_id=:companyID", nativeQuery = true)
    List<Map<String, Object>> getScrapPriceList(@Param("companyID") String companyID);

    @Modifying
    @Query(value= "update qlds.scrap_price set active_status = 'N' where company_id=:companyID", nativeQuery = true)
    void disableScrapPrice(@Param("companyID") String companyID);

    @Modifying
    @Query(value= "insert into qlds.scrap_price (company_id, copper_price, aluminum_price, cast_iron_price, steel_price, other_price, active_status, updated_user, updated_timestamp) values" +
                                               "(:companyID, :copperPrice, :aluminumPrice, :castIronPrice, :steelPrice, :otherPrice, 'Y', :updatedUser, :updatedTimestamp)",
           nativeQuery = true)
    void adjustNewScrapPrice(@Param("companyID") String companyID,
                             @Param("copperPrice") String copperPrice,
                             @Param("aluminumPrice") String aluminumPrice,
                             @Param("castIronPrice") String castIronPrice,
                             @Param("steelPrice") String steelPrice,
                             @Param("otherPrice") String otherPrice,
                             @Param("updatedUser") String updatedUser,
                             @Param("updatedTimestamp") Date updatedTimestamp);
}
