package com.quanlyduongsat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.EngineAnalysisInfo;

@Repository
public interface EngineAnalysisInfoRepository extends JpaRepository<EngineAnalysisInfo, Long> {

    List<EngineAnalysisInfo> findByCompanyID(String companyID);

}
