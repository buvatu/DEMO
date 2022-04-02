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

import com.demo.main.entity.OrderDetail;
import com.demo.main.model.Condition;
import com.demo.main.model.OrderInfo;
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

    /**
     * The naive solution is add more attribute to products table.
     * But when more domains come in app, the complexity and the waste of data increases
     * Example:
     *  At first, we just filter in mobile domain --> we just need some attributes such as: CPU, RAM, Screen size,...
     *  But what will happen if customers need a filter in consumer electric domain?
     *  We cannot continue adding more attributes to products
     * My solution:
     *  1 Product has 1 or many Spec (In this app, I use 1 - 1)
     *  1 Spec has many Standards with corresponding values
     *  To filter Product, we will filter with Standard name and value
     *  That's the way we can custom many dynamic filters as we want
     * @param categoryID
     * @param filterConditions
     * @param minPrice
     * @param maxPrice
     * @param pageNumber
     * @param pageSize
     * @param sortColumn
     * @param sortOrder
     * @return
     */
    @GetMapping("/product/items")
    public ResponseEntity<?> getProducts(@RequestParam(required = false) Long categoryID,
                                         @RequestBody(required = false) List<Condition> filterConditions,
                                         @RequestParam(required = false, defaultValue = "0") Integer minPrice,
                                         @RequestParam(required = false, defaultValue = "1000000000") Integer maxPrice,
                                         @RequestParam(required = false, defaultValue = "1") Integer pageNumber,
                                         @RequestParam(required = false, defaultValue = "10") Integer pageSize,
                                         @RequestParam(required = false, defaultValue = "price") String sortColumn,
                                         @RequestParam(required = false, defaultValue = "asc") String sortOrder) {
        return ResponseEntity.ok(mainService.getProductInfoList(categoryID, filterConditions, minPrice, maxPrice, pageNumber, pageSize, sortColumn, sortOrder));
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

    // This action occurs when user press button [Add To Card]
    @PostMapping("/order/detail")
    public ResponseEntity<?> addProductToShoppingCart(@RequestParam Long productID, @RequestParam Integer quantity) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mainService.getAddProductToShoppingCartResult(productID, quantity));
    }

    // This action occurs when user delete a product from shopping cart in OrderDetails screen
    @DeleteMapping("/order/detail")
    public ResponseEntity<?> removeProductFromShoppingCart(@RequestParam Long orderDetailID) {
        OrderInfo orderInfo = mainService.getRemoveProductFromShoppingCartResult(orderDetailID);
        if (orderInfo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found in shopping cart!!!");
        } else {
            return ResponseEntity.ok(orderInfo);
        }
    }

    // This action occurs when user update quantity of product from shopping cart in OrderDetails screen
    @PutMapping("/order/detail")
    public ResponseEntity<?> updateProductQuantityInShoppingCart(@RequestBody OrderDetail orderDetail) {
        return ResponseEntity.ok(mainService.updateProductQuantityInShoppingCart(orderDetail));
    }

    @GetMapping("/order/details")
    public ResponseEntity<?> getOrderDetails(@RequestParam Long orderID) {
        return ResponseEntity.ok(mainService.getOrderDetails(orderID));
    }

    @PutMapping("/order/{orderID}/checkout")
    public ResponseEntity<?> checkout(@RequestParam Long orderID) {
        String checkoutResult = mainService.checkout(orderID);
        if (checkoutResult == null) {
            return ResponseEntity.badRequest().body("Failed to checkout");
        }
        return ResponseEntity.ok(checkoutResult);
    }

}
