package com.quanlyduongsat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.ScrapClassifyDetail;

@Repository
public interface ScrapClassifyDetailRepository extends JpaRepository<ScrapClassifyDetail, Long> {

    List<ScrapClassifyDetail> findByEngineAnalysisID(Long engineAnalysisID);

    void deleteByEngineAnalysisID(Long engineAnalysisID);

}
