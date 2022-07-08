package com.quanlyduongsat.controller;

import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quanlyduongsat.entity.Engine;
import com.quanlyduongsat.entity.EngineAnalysisDetail;
import com.quanlyduongsat.entity.EngineAnalysisInfo;
import com.quanlyduongsat.entity.ScrapClassifyDetail;
import com.quanlyduongsat.repository.EngineAnalysisDetailRepository;
import com.quanlyduongsat.repository.EngineAnalysisInfoRepository;
import com.quanlyduongsat.repository.EngineRepository;
import com.quanlyduongsat.repository.ScrapClassifyDetailRepository;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class EngineController {

    @Autowired
    private EngineRepository engineRepository;

    @Autowired
    private EngineAnalysisInfoRepository engineAnalysisInfoRepository;

    @Autowired
    private EngineAnalysisDetailRepository engineAnalysisDetailRepository;

    @Autowired
    private ScrapClassifyDetailRepository scrapClassifyDetailRepository;

    @GetMapping(value="/engine/list")
    public ResponseEntity<?> getEngineList() {
        return ResponseEntity.ok().body(engineRepository.findAll());
    }

    @GetMapping(value="/engine/company/list")
    public ResponseEntity<?> getEngineListByCompany(@RequestParam String companyID) {
        return ResponseEntity.ok().body(engineRepository.findByCompanyID(companyID));
    }

    @PostMapping(value="/engine")
    public ResponseEntity<?> addEngine(@RequestBody Engine engine) {
        return ResponseEntity.ok().body(engineRepository.save(engine));
    }

    @PutMapping(value="/engine")
    public ResponseEntity<?> updateEngine(@RequestBody Engine engine) {
        return ResponseEntity.ok().body(engineRepository.save(engine));
    }

    @GetMapping(value="/engine/analysis/list")
    public ResponseEntity<?> getEngineAnalysisList(@RequestParam String companyID) {
        return ResponseEntity.ok().body(engineAnalysisInfoRepository.findByCompanyID(companyID));
    }

    @GetMapping(value="/engine/analysis/info")
    public ResponseEntity<?> getEngineAnalysisInfo(@RequestParam Long engineAnalysisID) {
        Optional<EngineAnalysisInfo> engineAnalysisInfoOptional = engineAnalysisInfoRepository.findById(engineAnalysisID);
        if (engineAnalysisInfoOptional.isPresent()) {
            return ResponseEntity.ok().body(engineAnalysisInfoOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value="/engine/analysis/info")
    public ResponseEntity<?> insertEngineAnalysisInfo(@RequestBody EngineAnalysisInfo engineAnalysisInfo) {
        return ResponseEntity.ok().body(engineAnalysisInfoRepository.save(engineAnalysisInfo));
    }

    @GetMapping(value="/engine/analysis/detail/list")
    public ResponseEntity<?> getEngineAnalysisDetailList(@RequestParam Long engineAnalysisID) {
        return ResponseEntity.ok().body(engineAnalysisDetailRepository.findByEngineAnalysisID(engineAnalysisID));
    }

    @PostMapping(value="/engine/analysis/detail") @Transactional
    public ResponseEntity<?> saveEngineAnalysisDetailList(@RequestParam Long engineAnalysisID, @RequestBody List<EngineAnalysisDetail> engineAnalysisDetailList) {
        engineAnalysisDetailRepository.deleteByEngineAnalysisID(engineAnalysisID);
        engineAnalysisDetailList.forEach(e -> e.setEngineAnalysisID(engineAnalysisID));
        return ResponseEntity.ok().body(engineAnalysisDetailRepository.saveAll(engineAnalysisDetailList));
    }

    @GetMapping(value="/engine/analysis/scrap-classify/list")
    public ResponseEntity<?> getScrapClassifyDetailList(@RequestParam Long engineAnalysisID) {
        return ResponseEntity.ok().body(scrapClassifyDetailRepository.findByEngineAnalysisID(engineAnalysisID));
    }

    @PostMapping(value="/engine/analysis/scrap-classify") @Transactional
    public ResponseEntity<?> saveScrapClassifyDetailList(@RequestParam Long engineAnalysisID, @RequestBody List<ScrapClassifyDetail> scrapClassifyDetailList) {
        scrapClassifyDetailRepository.deleteByEngineAnalysisID(engineAnalysisID);
        scrapClassifyDetailList.forEach(e -> e.setEngineAnalysisID(engineAnalysisID));
        return ResponseEntity.ok().body(scrapClassifyDetailRepository.saveAll(scrapClassifyDetailList));
    }

}
