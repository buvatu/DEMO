package com.demo.main.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.demo.main.model.Condition;
import com.demo.main.model.OrderDetails;
import com.demo.main.model.ProductDetails;
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
                                         @RequestParam(required = false, defaultValue = "10") Integer pageSize,
                                         @RequestParam(required = false, defaultValue = "asc") String sortOrder) {
        return ResponseEntity.ok(mainService.getProductInfoList(categoryID, filterConditions, pageNumber, pageSize, sortOrder));
    }

    @GetMapping("/product/{productID}")
    public ResponseEntity<?> getProductDetails(@PathVariable Long productID) {
        ProductDetails productDetails = mainService.getProductDetails(productID);
        if (productDetails == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found!!!");
        } else {
            return ResponseEntity.ok(productDetails);
        }
    }

    @PostMapping("/order/detail")
    public ResponseEntity<?> addProductToShoppingCart(@RequestParam Long productID, @RequestParam Integer quantity) {
        String result = mainService.getAddProductToShoppingCartResult(productID, quantity);
        if (!"SUCCESS".equals(result)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        } else {
            return ResponseEntity.status(HttpStatus.CREATED).body("Product was added to shopping cart successfully!!!");
        }
    }

    @DeleteMapping("/order/detail")
    public ResponseEntity<?> removeProductFromShoppingCart(@RequestParam Long orderDetailsID) {
        String result = mainService.getRemoveProductFromShoppingCartResult(orderDetailsID);
        if (!"SUCCESS".equals(result)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        } else {
            return ResponseEntity.status(HttpStatus.CREATED).body("Product was removed to shopping cart successfully!!!");
        }
    }

    @PutMapping("/order/detail")
    public ResponseEntity<?> updateProductQuantityInShoppingCart(@RequestBody OrderDetails orderDetails) {
        String result = mainService.updateProductQuantityInShoppingCart(orderDetails);
        if (!"SUCCESS".equals(result)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        } else {
            return ResponseEntity.status(HttpStatus.CREATED).body("Product was updated in shopping cart successfully!!!");
        }
    }

    @GetMapping("/order/details")
    public ResponseEntity<?> getOrderDetails(@RequestParam Long orderID) {
        return ResponseEntity.ok(mainService.getOrderDetails(orderID));
    }

}
