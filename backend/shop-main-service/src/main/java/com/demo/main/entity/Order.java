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
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor
@Table(name = "orders", uniqueConstraints = { @UniqueConstraint(columnNames = "order_name") })
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    @NotBlank
    @Size(max = 20)
    @Column(name = "order_name")
    private String orderName;

    @Size(max = 200)
    @Column(name = "owner")
    private String owner;

    @Size(max = 200)
    @Column(name = "approver")
    private String approver;

    @Size(max = 200)
    @Column(name = "tester")
    private String tester;

    @Size(max = 200)
    @Column(name = "shipper")
    private String shipper;

    @Size(max = 200)
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

    public Order(String orderName, String owner, String status) {
        this.orderName = orderName;
        this.owner = owner;
        this.status = status;
    }

    public Order(Long orderID, String status) {
        this.id = orderID;
        this.status = status;
    }
}
