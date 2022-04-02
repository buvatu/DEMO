package com.demo.main.service;

import java.util.List;

import com.demo.main.entity.OrderDetail;
import com.demo.main.model.Condition;
import com.demo.main.model.OrderInfo;
import com.demo.main.model.ProductDetails;
import com.demo.main.model.ProductInfo;

public interface MainService {

    List<ProductInfo> getProductInfoList(Long categoryID, List<Condition> filterConditions, Integer minPrice, Integer maxPrice, Integer pageNumber, Integer pageSize, String sortColumn, String sortOrder);

    ProductDetails getProductDetails(Long productID);

    OrderInfo getAddProductToShoppingCartResult(Long productID, Integer quantity);

    OrderInfo getRemoveProductFromShoppingCartResult(Long orderDetailsID);

    OrderInfo updateProductQuantityInShoppingCart(OrderDetail orderDetails);

    OrderInfo getOrderDetails(Long orderID);

    String checkout(Long orderID);

}
