package com.quanlyduongsat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quanlyduongsat.model.TechSpec;
import com.quanlyduongsat.repository.SpecRepository;
import com.quanlyduongsat.repository.SpecStandardRepository;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class SpecController {

    @Autowired
    private SpecRepository specRepository;

    @Autowired
    private SpecStandardRepository specStandardRepository;

    @GetMapping(value="/spec/list")
    public ResponseEntity<?> getSpecList() {
        return ResponseEntity.ok().body(specRepository.findAll());
    }

    @PostMapping(value="/spec")
    public ResponseEntity<?> addSpec(@RequestBody TechSpec techSpec) {
        specRepository.save(techSpec.getSpec());
        specStandardRepository.saveAll(techSpec.getSpecStandardList());
        return ResponseEntity.ok().body("ok");
    }

    @PutMapping(value="/spec")
    public ResponseEntity<?> updateStandard(@RequestBody TechSpec techSpec) {
        specRepository.save(techSpec.getSpec());
        specStandardRepository.disableSpecStandardBySpecID(techSpec.getSpec().getSpecID());
        specStandardRepository.saveAll(techSpec.getSpecStandardList());
        return ResponseEntity.ok().body("ok");
    }
}
