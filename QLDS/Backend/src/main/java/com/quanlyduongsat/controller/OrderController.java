package com.quanlyduongsat.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quanlyduongsat.entity.OrderInfo;
import com.quanlyduongsat.entity.TestRecipe;
import com.quanlyduongsat.model.Order;
import com.quanlyduongsat.repository.CategoryRepository;
import com.quanlyduongsat.repository.OrderDetailRepository;
import com.quanlyduongsat.repository.OrderInfoRepository;
import com.quanlyduongsat.repository.TestRecipeRepository;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class OrderController {

    @Autowired
    private OrderInfoRepository orderInfoRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private TestRecipeRepository testRecipeRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping(value="/category/list")
    public ResponseEntity<?> getCategoryList() {
        return ResponseEntity.ok().body(categoryRepository.findAll());
    }

    @GetMapping(value="/order")
    public ResponseEntity<?> getOrder(@RequestParam Long orderID) {
        Optional<OrderInfo> orderOptional = orderInfoRepository.findById(orderID);
        if (!orderOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("There is no stock-in order with this id");
        }
        Optional<TestRecipe> testRecipeOptional = testRecipeRepository.findByOrderID(orderID);
        TestRecipe testRecipe = testRecipeOptional.isPresent() ? testRecipeOptional.get() : new TestRecipe(null, orderID, "", "", "", "", "", "", "", "", "", "", null, "");
        return ResponseEntity.ok().body(new Order(orderOptional.get(), orderDetailRepository.findByOrderID(orderID), testRecipe));
    }

    @PostMapping(value="/order") @Transactional
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        OrderInfo orderInfo = orderInfoRepository.save(order.getOrderInfo());
        order.getOrderDetailList().forEach(e -> e.setOrderID(orderInfo.getId()));
        orderDetailRepository.saveAll(order.getOrderDetailList());
        return ResponseEntity.ok().body("ok");
    }

    @PutMapping(value="/order/accept") @Transactional
    public ResponseEntity<?> inspectOrder(@RequestBody Order order) {
        order.getOrderInfo().setStatus("tested");
        orderInfoRepository.save(order.getOrderInfo());
        testRecipeRepository.save(order.getTestRecipe());
        orderDetailRepository.saveAll(order.getOrderDetailList());
        return ResponseEntity.ok().body("ok");
    }

    @PutMapping(value="/order/approve") @Transactional
    public ResponseEntity<?> approveOrder(@RequestBody Order order) {
        orderInfoRepository.save(order.getOrderInfo());
        orderDetailRepository.saveAll(order.getOrderDetailList());
        return ResponseEntity.ok().body("ok");
    }

    @PutMapping(value="/order/cancel") @Transactional
    public ResponseEntity<?> cancelOrder(@RequestBody OrderInfo orderInfo) {
        orderInfoRepository.save(orderInfo);
        return ResponseEntity.ok().body("ok");
    }

}
