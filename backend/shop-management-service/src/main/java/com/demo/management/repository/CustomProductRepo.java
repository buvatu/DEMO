package com.demo.management.repository;

import java.util.List;

import com.demo.management.entity.Product;

public interface CustomProductRepo {
    List<Product> findProductByNameLikeAndCategory(String productName, Long categoryID);
}
