package com.demo.management.controller;

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.demo.management.entity.Standard;
import com.demo.management.repository.StandardRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@Validated
@RequestMapping("/standard")
public class StandardController {

    @Autowired
    StandardRepository standardRepository;

    @GetMapping("/all")
    public ResponseEntity<?> getAllStandards() {
        return ResponseEntity.ok(standardRepository.findAll());
    }

    @GetMapping("/items")
    public ResponseEntity<?> getStandards(@RequestParam @Valid @NotBlank String standardName) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardRepository.findByStandardNameLike(standardName));
    }

    @PostMapping
    public ResponseEntity<?> addStandard(@RequestParam @Valid @NotBlank String standardName) {
        standardRepository.save(new Standard(standardName));
        return ResponseEntity.ok("Standard " + standardName + " has been added to DB successfully");
    }

    @PutMapping
    public ResponseEntity<?> updateStandard(@RequestParam @Valid @NotNull Long id, @RequestParam @Valid @NotBlank String standardName) {
        standardRepository.save(new Standard(id, standardName));
        return ResponseEntity.ok("Standard " + standardName + " has been updated successfully");
    }

    @DeleteMapping
    public ResponseEntity<?> deleteStandard(@RequestParam @Valid @NotNull Long id) {
        standardRepository.deleteById(id);
        return ResponseEntity.ok("Standard has been deleted from DB successfully");
    }

}
