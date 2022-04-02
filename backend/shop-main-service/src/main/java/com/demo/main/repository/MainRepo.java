package com.demo.main.repository;

import java.util.List;

import com.demo.main.model.Condition;
import com.demo.main.model.OrderRecord;
import com.demo.main.model.ProductInfo;
import com.demo.main.model.SpecDetail;

public interface MainRepo {

    List<ProductInfo> findProductsByConditions(Long categoryID, List<Condition> filterConditions, Integer minPrice, Integer maxPrice, Integer pageNumber, Integer pageSize, String sortColumn, String sortOrder);

    List<SpecDetail> findSpecDetailsBySpecID(Long specID);

    List<OrderRecord> getOrderDetailsByOrderID(Long orderID, String status);

}
