package com.quanlyduongsat.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

import com.quanlyduongsat.entity.Material;
import com.quanlyduongsat.repository.MaterialRepository;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class MaterialController {

    @Autowired
    private MaterialRepository materialRepository;

    @GetMapping(value="/material/list")
    public ResponseEntity<?> getMaterialList() {
        return ResponseEntity.ok().body(materialRepository.findAllByOrderByMaterialIDAsc());
    }

    @GetMapping(value="/material/stock/list")
    public ResponseEntity<?> getMaterialListWithStockQuantity(@RequestParam String companyID) {
        return ResponseEntity.ok().body(materialRepository.getMaterialListWithStockQuantity(companyID));
    }

    @GetMapping(value="/material/in-stock/list")
    public ResponseEntity<?> getMaterialListInStock(@RequestParam String companyID) {
        return ResponseEntity.ok().body(materialRepository.getMaterialListInStock(companyID));
    }

    @GetMapping(value="/material/scrap/list")
    public ResponseEntity<?> getScrapMaterialList() {
        return ResponseEntity.ok().body(materialRepository.findAllScrapMaterialList());
    }

    @GetMapping(value="/material")
    public ResponseEntity<?> getMaterialInfo(@RequestParam String materialID) {
        Optional<Material> materialOptional = materialRepository.findByMaterialID(materialID);
        if (!materialOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Material not found!!!");
        }
        return ResponseEntity.ok().body(materialOptional.get());
    }

    @PostMapping(value="/material")
    public ResponseEntity<?> addMaterial(@RequestBody Material material) {
        return ResponseEntity.ok().body(materialRepository.save(material));
    }

    @DeleteMapping(value="/material")
    public ResponseEntity<?> deleteMaterial(@RequestParam Long id) {
        materialRepository.deleteById(id);
        return ResponseEntity.ok().body("ok");
    }

    @PutMapping(value="/material")
    public ResponseEntity<?> updateMaterial(@RequestBody Material material) {
        return ResponseEntity.ok().body(materialRepository.save(material));
    }

}
