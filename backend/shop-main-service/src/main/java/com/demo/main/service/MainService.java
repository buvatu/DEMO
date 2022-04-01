package com.demo.main.service;

import java.util.List;

import com.demo.main.model.Condition;
import com.demo.main.model.OrderRecord;
import com.demo.main.model.ProductDetails;
import com.demo.main.model.ProductInfo;

public interface MainService {

    List<ProductInfo> getProductInfoList(Long categoryID, List<Condition> filterConditions, Integer pageNumber, Integer pageSize, String sortOrder);

    ProductDetails getProductDetails(Long productID);

    String getAddProductToShoppingCartResult(Long productID, Integer quantity);

    List<OrderRecord> getOrderDetails(String status);
}
