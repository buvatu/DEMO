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

import com.quanlyduongsat.entity.Spec;
import com.quanlyduongsat.repository.SpecRepository;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class SpecController {

    @Autowired
    private SpecRepository specRepository;

    @GetMapping(value="/spec/list")
    public ResponseEntity<?> getSpecList() {
        return ResponseEntity.ok().body(specRepository.findByStatus("A"));
    }

    @PostMapping(value="/spec")
    public ResponseEntity<?> addSpec(@RequestBody Spec spec) {
        return ResponseEntity.ok().body(specRepository.save(spec));
    }

    @PutMapping(value="/spec")
    public ResponseEntity<?> updateStandard(@RequestBody Spec spec) {
        return ResponseEntity.ok().body(specRepository.save(spec));
    }
}
