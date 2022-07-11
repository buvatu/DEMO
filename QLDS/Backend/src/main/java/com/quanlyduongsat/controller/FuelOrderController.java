package com.quanlyduongsat.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quanlyduongsat.entity.Material;
import com.quanlyduongsat.entity.OrderDetail;
import com.quanlyduongsat.entity.FuelOrderInfo;
import com.quanlyduongsat.entity.Stock;
import com.quanlyduongsat.entity.TestRecipe;
import com.quanlyduongsat.model.Order;
import com.quanlyduongsat.repository.CategoryRepository;
import com.quanlyduongsat.repository.FuelOrderInfoRepository;
import com.quanlyduongsat.repository.MaterialRepository;
import com.quanlyduongsat.repository.OrderDetailRepository;
import com.quanlyduongsat.repository.OrderInfoRepository;
import com.quanlyduongsat.repository.OtherConsumerRepository;
import com.quanlyduongsat.repository.StockRepository;
import com.quanlyduongsat.repository.TestRecipeRepository;

@RestController()
@CrossOrigin
@RequestMapping(value = "/fuel", produces = MediaType.APPLICATION_JSON_VALUE)
public class FuelOrderController {

    @Autowired
    private FuelOrderInfoRepository fuelOrderInfoRepository;

    @Autowired
    private TestRecipeRepository testRecipeRepository;

//    @Autowired
//    private StockRepository stockRepository;
//
//    @Autowired
//    private MaterialRepository materialRepository;

    @GetMapping(value="/order")
    public ResponseEntity<?> getOrder(@RequestParam Long fuelOrderID) {
        Optional<FuelOrderInfo> orderOptional = fuelOrderInfoRepository.findById(fuelOrderID);
        if (!orderOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("There is no fuel order with this id");
        }
//        Optional<TestRecipe> testRecipeOptional = testRecipeRepository.findByOrderID(fuelOrderID);
//        TestRecipe testRecipe = testRecipeOptional.isPresent() ? testRecipeOptional.get() : new TestRecipe(null, fuelOrderID, "", "", "", "", "", "", "", "", "", "", null, "");
//        return ResponseEntity.ok().body(new Order(orderOptional.get(), fuelOrderInfoRepository.findByOrderID(fuelOrderID), testRecipe));
        return ResponseEntity.ok().body(orderOptional.get());
    }

    @GetMapping(value="/order/list")
    public ResponseEntity<?> getOrderList(@RequestParam String role, @RequestParam String userID) {
        if ("phongkehoachvattu".equals(role)) {
            return ResponseEntity.ok().body(fuelOrderInfoRepository.findByRequestor(userID));
        }
        if ("phongkythuat".equals(role)) {
            return ResponseEntity.ok().body(fuelOrderInfoRepository.findByTester(userID));
        }
        if ("phongketoantaichinh".equals(role)) {
            return ResponseEntity.ok().body(fuelOrderInfoRepository.findByApprover(userID));
        }
        return ResponseEntity.ok().body("");
    }


    @PostMapping(value="/order") @Transactional
    public ResponseEntity<?> createOrder(@RequestBody FuelOrderInfo fuelOrder) {
        FuelOrderInfo orderInfo = fuelOrderInfoRepository.save(fuelOrder);
        return ResponseEntity.ok().body(orderInfo.getId());
    }

    @PutMapping(value="/order/accept") @Transactional
    public ResponseEntity<?> inspectOrder(@RequestBody FuelOrderInfo fuelOrder) {
    	fuelOrderInfoRepository.save(fuelOrder);
//        testRecipeRepository.save(order.getTestRecipe());
//        fuelOrderInfoRepository.saveAll(order.getOrderDetailList());
        return ResponseEntity.ok().body("ok");
    }

//    @PutMapping(value="/order/approve") @Transactional
//    public ResponseEntity<?> approveOrder(@RequestBody Order order) {
//        OrderInfo orderInfo = fuelOrderInfoRepository.save(order.getOrderInfo());
//        orderDetailRepository.saveAll(order.getOrderDetailList());
//        for (OrderDetail orderDetail : order.getOrderDetailList()) {
//            String orderType = orderInfo.getOrderType();
//            String materialID = orderDetail.getMaterialID();
//            String companyID = order.getOrderInfo().getCompanyID();
//            Optional<Stock> stockItemOptional = stockRepository.findByCompanyIDAndMaterialID(companyID, materialID);
//            if ("O".equals(orderType)) {
//                if (!stockItemOptional.isPresent()) {
//                    TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
//                    return ResponseEntity.status(HttpStatus.CONFLICT).body("Failed to commit data");
//                }
//                Stock stockItem = stockItemOptional.get();
//                if (!"A".equals(stockItem.getStatus())) {
//                    TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
//                    return ResponseEntity.status(HttpStatus.CONFLICT).body("Failed to commit data");
//                }
//                if (stockItem.getQuantity() < orderDetail.getApproveQuantity()) {
//                    TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
//                    return ResponseEntity.status(HttpStatus.CONFLICT).body("Failed to commit data");
//                }
//                Material material = materialRepository.findByMaterialID(materialID).get();
//                if (material.getMinimumQuantity() != null && stockItem.getQuantity() - orderDetail.getApproveQuantity() < material.getMinimumQuantity()) {
//                    TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
//                    return ResponseEntity.status(HttpStatus.CONFLICT).body("Failed to commit data");
//                }
//                if (orderDetail.getApproveAmount() != null && stockItem.getAmount().compareTo(orderDetail.getApproveAmount()) == -1) {
//                    TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
//                    return ResponseEntity.status(HttpStatus.CONFLICT).body("Failed to commit data");
//                }
//                stockItem.setQuantity(stockItem.getQuantity() - orderDetail.getApproveQuantity());
//                if (orderDetail.getApproveAmount() != null) {
//                    stockItem.setAmount(stockItem.getAmount().subtract(orderDetail.getApproveAmount()));
//                }
//                stockRepository.save(stockItem);
//            }
//
//            if ("I".equals(orderType)) {
//                Stock stockItem = new Stock();
//                if (stockItemOptional.isPresent()) {
//                    stockItem = stockItemOptional.get();
//                }
//                if ("A".equals(stockItem.getStatus())) {
//                    stockItem.setQuantity(stockItem.getQuantity() + orderDetail.getApproveQuantity());
//                    stockItem.setAmount(stockItem.getAmount().add(orderDetail.getApproveAmount()));
//                } else {
//                    stockItem.setCompanyID(companyID);
//                    stockItem.setMaterialID(materialID);
//                    stockItem.setQuantity(orderDetail.getApproveQuantity());
//                    stockItem.setAmount(orderDetail.getApproveAmount());
//                    stockItem.setStatus("A");
//                }
//                stockRepository.save(stockItem);
//            }
//
//        }
//        return ResponseEntity.ok().body("ok");
//    }
//
//    @PutMapping(value="/order/cancel") @Transactional
//    public ResponseEntity<?> cancelOrder(@RequestBody OrderInfo orderInfo) {
//        orderInfoRepository.save(orderInfo);
//        return ResponseEntity.ok().body("ok");
//    }

}
