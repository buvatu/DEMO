package com.quanlyduongsat.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quanlyduongsat.entity.Spec;
import com.quanlyduongsat.entity.SpecStandard;
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

    @GetMapping(value="/spec")
    public ResponseEntity<?> getSpec(@RequestParam String specID) {
        Optional<Spec> specOptional = specRepository.findBySpecID(specID);
        if (!specOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Spec not found!!!");
        }
        List<SpecStandard> specStandardList = specStandardRepository.findBySpecID(specID);
        if (specStandardList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Spec not found!!!");
        }
        TechSpec techSpec = new TechSpec();
        techSpec.setSpec(specOptional.get());
        techSpec.setSpecStandardList(specStandardList);
        return ResponseEntity.ok().body(techSpec);
    }

    @GetMapping(value="/spec/standard/list")
    public ResponseEntity<?> getSpecStandardList(@RequestParam String specID) {
        return ResponseEntity.ok().body(specStandardRepository.findBySpecID(specID));
    }

    @PostMapping(value="/spec")
    public ResponseEntity<?> addSpec(@RequestBody TechSpec techSpec) {
        specRepository.save(techSpec.getSpec());
        specStandardRepository.saveAll(techSpec.getSpecStandardList());
        return ResponseEntity.ok().body("ok");
    }

    @PutMapping(value="/spec") @Transactional
    public ResponseEntity<?> updateStandard(@RequestBody TechSpec techSpec) {
        specRepository.save(techSpec.getSpec());
        specStandardRepository.disableSpecStandardBySpecID(techSpec.getSpec().getSpecID());
        specStandardRepository.saveAll(techSpec.getSpecStandardList());
        return ResponseEntity.ok().body("ok");
    }
}
