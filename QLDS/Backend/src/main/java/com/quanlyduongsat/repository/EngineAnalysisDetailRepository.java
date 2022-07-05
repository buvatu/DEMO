package com.quanlyduongsat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.EngineAnalysisDetail;

@Repository
public interface EngineAnalysisDetailRepository extends JpaRepository<EngineAnalysisDetail, Long> {

    List<EngineAnalysisDetail> findByEngineAnalysisID(Long engineAnalysisID);

    void deleteByEngineAnalysisID(Long engineAnalysisID);

}
