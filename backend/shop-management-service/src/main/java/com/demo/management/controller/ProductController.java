package com.demo.management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.demo.management.entity.Product;
import com.demo.management.repository.CustomProductRepo;
import com.demo.management.repository.ProductRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@Validated
@RequestMapping("/product")
public class ProductController {

    @Autowired
    ProductRepository productRepository;

    @Autowired
    CustomProductRepo customProductRepo;

    @GetMapping("/all")
    public ResponseEntity<?> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/items")
    public ResponseEntity<?> getProducts(@RequestParam(required = false) String productName, @RequestParam(required = false) Long categoryID) {
        return ResponseEntity.ok(customProductRepo.findProductByNameLikeAndCategory(productName, categoryID));
    }

    @PostMapping
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body("Product" + product.getProductName() + " has been added to DB successfully");
    }

    @PutMapping
    public ResponseEntity<?> updateProduct(@RequestBody Product product) {
        productRepository.save(product);
        return ResponseEntity.ok("Product" + product.getProductName() + " has been updated successfully");
    }

}

