package com.demo.management.entity;

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
@Table(name = "products", uniqueConstraints = { @UniqueConstraint(columnNames = "product_name") })
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    @NotBlank
    @Size(max = 200)
    @Column(name = "product_name")
    private String productName;

    @Column(name = "cost_price")
    private BigDecimal costPrice;

    @Column(name = "selling_price")
    private BigDecimal sellingPrice;

    @Column(name = "description")
    private String description;

    @NonNull
    @Column(name = "category_id")
    private Long categoryID;

    @Column(name = "spec_id")
    private Long specID;

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

}
