package com.demo.main.model;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OrderRecord {

    private Long id;
    private Long orderID;
    private String orderName;
    private Long productID;
    private String productName;
    private BigDecimal price;
    private Integer quantity;

}
