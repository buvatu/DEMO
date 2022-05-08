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

import com.quanlyduongsat.entity.Engine;
import com.quanlyduongsat.repository.EngineRepository;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class EngineController {

    @Autowired
    private EngineRepository engineRepository;

    @GetMapping(value="/engine/list")
    public ResponseEntity<?> getEngineList() {
        return ResponseEntity.ok().body(engineRepository.findAll());
    }

    @PostMapping(value="/engine")
    public ResponseEntity<?> addEngine(@RequestBody Engine engine) {
        return ResponseEntity.ok().body(engineRepository.save(engine));
    }

    @PutMapping(value="/engine")
    public ResponseEntity<?> updateEngine(@RequestBody Engine engine) {
        return ResponseEntity.ok().body(engineRepository.save(engine));
    }

}
