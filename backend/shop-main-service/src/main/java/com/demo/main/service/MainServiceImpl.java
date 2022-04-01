package com.demo.main.service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import com.demo.main.model.Condition;
import com.demo.main.model.Order;
import com.demo.main.model.OrderDetails;
import com.demo.main.model.OrderRecord;
import com.demo.main.model.ProductDetails;
import com.demo.main.model.ProductInfo;
import com.demo.main.repository.MainRepo;
import com.demo.main.repository.OrderDetailsRepository;
import com.demo.main.repository.OrderRepository;

@Service
@Transactional
public class MainServiceImpl implements MainService {

    @Autowired
    MainRepo mainRepo;

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    OrderDetailsRepository orderDetailsRepository;

    @Override
    public ProductDetails getProductDetails(Long productID) {
        return mainRepo.getProductDetails(productID);
    }

    @Override
    public List<ProductInfo> getProductInfoList(Long categoryID, List<Condition> filterConditions, Integer pageNumber, Integer pageSize, String sortOrder) {
        return mainRepo.findProductsByConditions(categoryID, filterConditions, pageNumber, pageSize, sortOrder);
    }

    @Override
    public String getAddProductToShoppingCartResult(Long productID, Integer quantity) {
        // At first, check in orders table is there any active order or not?
        String username = (String) RequestContextHolder.getRequestAttributes().getAttribute("currentLoggedInUser", RequestAttributes.SCOPE_REQUEST);
        List<Order> activeOrders = orderRepository.findOrdersByUsernameAndStatus("active", username);
        if (activeOrders.size() == 0) {
            Order newOrder = orderRepository.save(new Order(UUID.randomUUID().toString().replace("-", "").substring(0, 20), username, "active"));
            orderDetailsRepository.save(new OrderDetails(newOrder.getId(), productID, quantity));
            return "SUCCESS";
        }

        // Second, check in order details table
        orderDetailsRepository.upsertOrderDetails(activeOrders.get(0).getId(), productID, quantity, new Date(), username);
        return "SUCCESS";
    }

    @Override
    public List<OrderRecord> getOrderDetails(String status) {
        return mainRepo.getOrderDetailsOfUser((String) RequestContextHolder.getRequestAttributes().getAttribute("currentLoggedInUser", RequestAttributes.SCOPE_REQUEST), status);
    }

}
