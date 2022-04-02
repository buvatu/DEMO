package com.demo.management.controller;

import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.demo.management.entity.Spec;
import com.demo.management.entity.SpecStandard;
import com.demo.management.repository.SpecRepository;
import com.demo.management.repository.SpecStandardRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@Validated
@RequestMapping("/spec")
public class SpecController {

    @Autowired
    SpecRepository specRepository;

    @Autowired
    SpecStandardRepository specStandardRepository;

    @GetMapping("/all")
    public ResponseEntity<?> getAllSpecs() {
        return ResponseEntity.ok(specRepository.findAll());
    }

    @GetMapping("/items")
    public ResponseEntity<?> getSpecs(@RequestParam @Valid @NotBlank String specName) {
        return ResponseEntity.ok(specRepository.findBySpecNameLike(specName));
    }

    @PostMapping
    public ResponseEntity<?> addSpec(@RequestParam @Valid @NotBlank String specName) {
        specRepository.save(new Spec(specName));
        return ResponseEntity.status(HttpStatus.CREATED).body("Spec " + specName + " has been added to DB successfully");
    }

    @PutMapping
    public ResponseEntity<?> updateSpec(@RequestParam @Valid @NotNull Long id, @RequestParam @Valid @NotBlank String specName) {
        specRepository.save(new Spec(id, specName));
        return ResponseEntity.ok("Spec " + specName + " has been updated successfully");
    }

    @DeleteMapping
    public ResponseEntity<?> deleteSpec(@RequestParam @Valid @NotNull Long id) {
        specRepository.deleteById(id);
        return ResponseEntity.ok("Spec has been deleted from DB successfully");
    }

    @GetMapping("/{specID}/standards")
    public ResponseEntity<?> getSpecStandards(@PathVariable @Valid @NotBlank Long specID) {
        return ResponseEntity.ok(specStandardRepository.findBySpecID(specID));
    }

    @PostMapping("/{specID}/standards")
    public ResponseEntity<?> addSpecStandards(@PathVariable Long specID, @RequestBody List<SpecStandard> specStandards) {
        if (specStandardRepository.findBySpecID(specID).size() > 0) {
            specStandardRepository.deleteBySpecID(specID);
        }
        specStandardRepository.saveAll(specStandards);
        return ResponseEntity.status(HttpStatus.CREATED).body("New standards were added successfully");
    }

}
