package com.demo.main.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OrderInfo {

    private Long id;
    private String orderName;
    private String owner;
    private String status;
    private List<OrderRecord> orderRecordList;

}
