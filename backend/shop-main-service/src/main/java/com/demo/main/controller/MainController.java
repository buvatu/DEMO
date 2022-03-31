package com.demo.main.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.demo.main.model.Condition;
import com.demo.main.repository.MainRepo;
import com.demo.main.service.MainService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@Validated
public class MainController {

    @Autowired
    MainRepo customProductRepo;

    @Autowired
    MainService mainService;

    @GetMapping("/product/items")
    public ResponseEntity<?> getProducts(@RequestParam(required = false) Long categoryID,
                                         @RequestBody(required = false) List<Condition> filterConditions,
                                         @RequestParam(required = false, defaultValue = "1") Integer pageNumber,
                                         @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        return ResponseEntity.ok(customProductRepo.findProductsByConditions(categoryID, filterConditions, pageNumber, pageSize));
    }

    @GetMapping("/product/{productID}")
    public ResponseEntity<?> getProductDetails(@PathVariable Long productID) {
        return ResponseEntity.ok(mainService.getProductDetails(productID));
    }

}
