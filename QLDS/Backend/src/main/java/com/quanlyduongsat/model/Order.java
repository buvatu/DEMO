package com.quanlyduongsat.model;

import java.util.List;

import com.quanlyduongsat.entity.OrderDetail;
import com.quanlyduongsat.entity.OrderInfo;
import com.quanlyduongsat.entity.TestRecipe;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Order {

    private OrderInfo orderInfo;
    private List<OrderDetail> orderDetailList;
    private TestRecipe testRecipe;

}
