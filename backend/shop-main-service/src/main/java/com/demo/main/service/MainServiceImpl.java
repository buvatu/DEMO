package com.demo.main.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import com.demo.main.entity.Order;
import com.demo.main.entity.OrderDetail;
import com.demo.main.entity.Product;
import com.demo.main.entity.Stock;
import com.demo.main.model.Condition;
import com.demo.main.model.OrderInfo;
import com.demo.main.model.OrderRecord;
import com.demo.main.model.ProductDetails;
import com.demo.main.model.ProductInfo;
import com.demo.main.repository.MainRepo;
import com.demo.main.repository.OrderDetailRepository;
import com.demo.main.repository.OrderRepository;
import com.demo.main.repository.ProductRepository;
import com.demo.main.repository.StockRepository;

@Service
@Transactional
public class MainServiceImpl implements MainService {

    @Autowired
    MainRepo mainRepo;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    StockRepository stockRepository;

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    OrderDetailRepository orderDetailsRepository;

    @Override
    public ProductDetails getProductDetails(Long productID) {
        Optional<Product> productOptional = productRepository.findById(productID);
        if (!productOptional.isPresent()) {
            return null;
        }
        Product product = productOptional.get();
        Integer productQuantity = 0;
        Optional<Integer> productQuantityOptional = stockRepository.findProductQuantity(product.getId());
        if (productQuantityOptional.isPresent()) {
            productQuantity = productQuantityOptional.get();
        }

        return new ProductDetails(productID,
                                  product.getProductName(),
                                  product.getDescription(),
                                  product.getSellingPrice(),
                                  productQuantity,
                                  mainRepo.findSpecDetailsBySpecID(product.getSpecID()));
    }

    @Override
    public List<ProductInfo> getProductInfoList(Long categoryID, List<Condition> filterConditions, Integer minPrice, Integer maxPrice, Integer pageNumber, Integer pageSize, String sortColumn, String sortOrder) {
        return mainRepo.findProductsByConditions(categoryID, filterConditions, minPrice, maxPrice, pageNumber, pageSize, sortColumn, sortOrder);
    }

    @Override
    public OrderInfo getAddProductToShoppingCartResult(Long productID, Integer quantity) {
        String username = (String) RequestContextHolder.getRequestAttributes().getAttribute("currentLoggedInUser", RequestAttributes.SCOPE_REQUEST);
        List<Order> activeOrders = orderRepository.findOrdersByUsernameAndStatus("active", username);
        if (activeOrders.size() == 0) {
            Order newOrder = orderRepository.save(
                    new Order(UUID.randomUUID().toString().replace("-", "").substring(0, 20), username, "active"));
            orderDetailsRepository.save(new OrderDetail(newOrder.getId(), productID, quantity, "waiting for checkout"));
            return new OrderInfo(newOrder.getId(), newOrder.getOrderName(), newOrder.getOwner(), newOrder.getStatus(),
                    mainRepo.getOrderDetailsByOrderID(newOrder.getId(), "waiting for checkout"));
        } else {
            // orderDetailsRepository.upsertOrderDetails(activeOrders.get(0).getId(),
            // productID, quantity, "waiting for checkout", new Date(), username);
            Optional<OrderDetail> orderDetailOptional = orderDetailsRepository
                    .findOrderDetailByOrderIDAndProductID(activeOrders.get(0).getId(), productID);
            if (orderDetailOptional.isPresent()) {
                OrderDetail orderDetail = orderDetailOptional.get();
                orderDetail.setQuantity(orderDetail.getQuantity() + quantity);
                orderDetailsRepository.save(orderDetail);
            } else {
                orderDetailsRepository.save(new OrderDetail(activeOrders.get(0).getId(), productID, quantity, "waiting for checkout"));
            }
            return new OrderInfo(activeOrders.get(0).getId(), activeOrders.get(0).getOrderName(),
                    activeOrders.get(0).getOwner(), activeOrders.get(0).getStatus(),
                    mainRepo.getOrderDetailsByOrderID(activeOrders.get(0).getId(), "waiting for checkout"));
        }
    }

    @Override
    public OrderInfo getRemoveProductFromShoppingCartResult(Long orderDetailID) {
        Optional<OrderDetail> orderDetailOptional = orderDetailsRepository.findById(orderDetailID);
        if (orderDetailOptional.isPresent()) {
            OrderDetail orderDetail = orderDetailOptional.get();
            orderDetail.setQuantity(0);
            orderDetail.setStatus("canceled");
            orderDetailsRepository.save(orderDetail);
            Long orderID = Long.valueOf(orderDetailsRepository.getOrderIDByOrderDetailID(orderDetailID));
            Order order = orderRepository.getById(orderID);
            // Change status of order if this product is the last item
            if (orderDetailsRepository.countNumberOfOrderDetails(orderID, "waiting for checkout") == 0) {
                order.setStatus("removed");
                orderRepository.save(order);
                return new OrderInfo(order.getId(), order.getOrderName(), order.getOwner(), order.getStatus(), new ArrayList<OrderRecord>());
            } else {
                return new OrderInfo(order.getId(), order.getOrderName(), order.getOwner(), order.getStatus(), mainRepo.getOrderDetailsByOrderID(orderID, "waiting for checkout"));
            }
        } else {
            return null;
        }
    }

    @Override
    public OrderInfo updateProductQuantityInShoppingCart(OrderDetail orderDetail) {
        orderDetailsRepository.save(orderDetail);
        Order order = orderRepository.getById(orderDetail.getOrderID());
        return new OrderInfo(order.getId(), order.getOrderName(), order.getOwner(), order.getStatus(), mainRepo.getOrderDetailsByOrderID(orderDetail.getOrderID(), "waiting for checkout"));
    }

    @Override
    public OrderInfo getOrderDetails(Long orderID) {
        Order order = orderRepository.getById(orderID);
        return new OrderInfo(order.getId(), order.getOrderName(), order.getOwner(), order.getStatus(), mainRepo.getOrderDetailsByOrderID(orderID, null));
    }

    @Override
    public String checkout(Long orderID) {
        Optional<Order> orderOptional = orderRepository.findById(orderID);
        if (!orderOptional.isPresent()) {
            return null;
        }
        Order order = orderOptional.get();
        if (!"active".equals(order.getStatus())) {
            return null;
        }
        List<OrderDetail> orderDetails = orderDetailsRepository.getOrderDetailsByOrderID(orderID);
        List<Stock> stockList = new ArrayList<Stock>();
        for (OrderDetail orderDetail : orderDetails) {
            if ("removed".equals(orderDetail.getStatus())) {
                continue;
            }
            Optional<Stock> stockOptional = stockRepository.findStockByProductID(orderDetail.getProductID());
            if (!stockOptional.isPresent()) {
                return null;
            }
            Stock stock = stockOptional.get();
            if (stock.getQuantity() < orderDetail.getQuantity()) {
                return null;
            }
            stock.setQuantity(stock.getQuantity() - orderDetail.getQuantity());
            stockList.add(stock);
            orderDetail.setStatus("waiting for pickup");
        }
        if (stockList.isEmpty()) {
            return null;
        }
        // Update status
        order.setStatus("processing");
        orderDetailsRepository.saveAll(orderDetails);
        stockRepository.saveAll(stockList);
        orderRepository.save(order);
        return "SUCCESS";
    }

}
