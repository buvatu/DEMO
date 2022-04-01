package com.demo.main.repository;

import java.util.List;

import com.demo.main.model.Condition;
import com.demo.main.model.OrderRecord;
import com.demo.main.model.ProductDetails;
import com.demo.main.model.ProductInfo;
import com.demo.main.model.SpecDetail;

public interface MainRepo {

    List<ProductInfo> findProductsByConditions(Long categoryID, List<Condition> filterConditions, Integer pageNumber, Integer pageSize, String sortOrder);

    List<SpecDetail> findSpecDetailsBySpecID(Long specID);

    ProductDetails getProductDetails(Long productID);

    List<OrderRecord> getOrderDetailsByOrderID(Long orderID);

}
