package com.quanlyduongsat.entity;

import java.math.BigDecimal;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;

import org.springframework.security.core.context.SecurityContextHolder;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_detail")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id")
    private Long orderID;

    @Column(name = "material_id")
    private String materialID;

    @Column(name = "request_quantity")
    private BigDecimal requestQuantity;
    @Column(name = "test_quantity")
    private BigDecimal testQuantity;
    @Column(name = "approve_quantity")
    private BigDecimal approveQuantity;

    @Column(name = "request_amount")
    private BigDecimal requestAmount;
    @Column(name = "test_amount")
    private BigDecimal testAmount;
    @Column(name = "approve_amount")
    private BigDecimal approveAmount;

    @Column(name = "updated_timestamp")
    private Date updatedTimestamp;
    @Column(name = "updated_user")
    private String updatedUser;

    @PrePersist
    protected void onCreate() {
        updatedUser = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        updatedTimestamp = new Date();
    }

    @PreUpdate
    protected void preUpdate() {
        updatedUser = (String) (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        updatedTimestamp = new Date();
    }
}
