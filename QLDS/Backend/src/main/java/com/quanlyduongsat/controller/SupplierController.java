package com.quanlyduongsat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quanlyduongsat.entity.Supplier;
import com.quanlyduongsat.repository.SupplierRepository;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class SupplierController {

    @Autowired
    private SupplierRepository supplierRepository;

    @GetMapping(value="/supplier/list")
    public ResponseEntity<?> getSupplierList() {
        return ResponseEntity.ok().body(supplierRepository.findAll());
    }

    @PostMapping(value="/supplier")
    public ResponseEntity<?> addSupplier(@RequestBody Supplier supplier) {
        return ResponseEntity.ok().body(supplierRepository.save(supplier));
    }

    @PutMapping(value="/supplier")
    public ResponseEntity<?> updateSupplier(@RequestBody Supplier supplier) {
        return ResponseEntity.ok().body(supplierRepository.save(supplier));
    }

    @DeleteMapping(value="/supplier")
    public ResponseEntity<?> deleteSupplier(@RequestParam Long id) {
        supplierRepository.deleteById(id);
        return ResponseEntity.ok().body("ok");
    }
}
