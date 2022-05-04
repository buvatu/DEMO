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

import com.quanlyduongsat.entity.Standard;
import com.quanlyduongsat.repository.StandardRepository;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class StandardController {

    @Autowired
    private StandardRepository standardRepository;

    @GetMapping(value="/standard/list")
    public ResponseEntity<?> getStandardList() {
        return ResponseEntity.ok().body(standardRepository.findAll());
    }

    @PostMapping(value="/standard")
    public ResponseEntity<?> addStandard(@RequestBody Standard standard) {
        return ResponseEntity.ok().body(standardRepository.save(standard));
    }

    @PutMapping(value="/standard")
    public ResponseEntity<?> updateStandard(@RequestBody Standard standard) {
        return ResponseEntity.ok().body(standardRepository.save(standard));
    }

}
