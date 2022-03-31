package com.demo.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.demo.main.model.ProductDetails;
import com.demo.main.repository.MainRepo;

@Service
public class MainServiceImpl implements MainService {

    @Autowired
    MainRepo mainRepo;

    @Override
    public ProductDetails getProductDetails(Long productID) {
        return null;
    }

}
