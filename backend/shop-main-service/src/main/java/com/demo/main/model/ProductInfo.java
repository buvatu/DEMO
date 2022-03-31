package com.demo.main.model;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ProductInfo {

    private Long id;
    private String productName;
    private Long categoryID;
    private String categoryName;
    private String description;
    private BigDecimal sellingPrice;
    private Integer stockQuantity;

}
