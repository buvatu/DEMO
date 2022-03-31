package com.demo.management.controller;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.demo.management.model.Category;
import com.demo.management.repository.CategoryRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@Validated
@RequestMapping("/category")
public class CategoryController {

    @Autowired
    CategoryRepository categoryRepository;

    @GetMapping("/all")
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addCategory(@RequestParam @Valid @NotBlank String categoryName) {
        categoryRepository.save(new Category(categoryName));
        return ResponseEntity.ok("Category " + categoryName + " has been added to DB successfully");
    }

    @PutMapping
    public ResponseEntity<?> updateCategory(@RequestParam @Valid @NotNull Long id, @RequestParam @Valid @NotBlank String categoryName) {
        categoryRepository.save(new Category(id, categoryName));
        return ResponseEntity.ok("Category " + categoryName + " has been updated successfully");
    }

    @DeleteMapping
    public ResponseEntity<?> deleteCategory(@RequestParam @Valid @NotNull Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok("Category has been deleted from DB successfully");
    }

}
