package com.demo.main.entity;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor
@Table(name = "order_details", uniqueConstraints = { @UniqueConstraint(columnNames = {"order_id", "product_id"} ) })
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    @Column(name = "order_id")
    private Long orderID;

    @NonNull
    @Column(name = "product_id")
    private Long productID;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "status")
    private String status;

    @Column(name = "updated_timestamp")
    private Date updatedTimestamp;

    @Column(name = "updated_user")
    private String updatedUser;

    @PrePersist
    protected void onCreate() {
        updatedTimestamp = new Date();
        updatedUser = (String) RequestContextHolder.getRequestAttributes().getAttribute("currentLoggedInUser", RequestAttributes.SCOPE_REQUEST);
    }

    @PreUpdate
    protected void preUpdate() {
        updatedTimestamp = new Date();
        updatedUser = (String) RequestContextHolder.getRequestAttributes().getAttribute("currentLoggedInUser", RequestAttributes.SCOPE_REQUEST);
    }

    public OrderDetail(Long orderID, Long productID, Integer quantity, String status) {
        this.orderID = orderID;
        this.productID = productID;
        this.quantity = quantity;
        this.status = status;
    }
}
