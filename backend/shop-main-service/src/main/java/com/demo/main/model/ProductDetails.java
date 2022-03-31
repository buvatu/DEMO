package com.demo.main.model;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ProductDetails {

    private Long id;
    private String productName;
    private String description;
    private BigDecimal sellingPrice;
    private List<SpecDetail> specDetails;
    private Integer stockQuantity;

}
