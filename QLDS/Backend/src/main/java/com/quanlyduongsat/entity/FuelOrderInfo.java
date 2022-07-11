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
import javax.validation.constraints.NotBlank;

import org.springframework.security.core.context.SecurityContextHolder;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "fuel_order_info")
public class FuelOrderInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    @NotBlank
    @Column(name = "fuel_order_type")
    private String fuelOrderType;

    private String status;
    
    @Column(name = "fuel_material_id")
    private String fuelMaterialID;
    
    @Column(name = "fuel_material_name")
    private String fuelMaterialName;
    
    @Column(name = "fuel_order_note")
    private String fuelOrderNote;
    
    @Column(name = "real_fuel_quantity")
    private BigDecimal realFuelQuantity;
    
    @Column(name = "standard_fuel_quantity")
    private BigDecimal standardFuelQuantity;

    private String requestor;
    
    @Column(name = "request_date")
    private Date requestDate;
    
    private String supplier;
    
    private String consumer;

    private String tester;
    
    @Column(name = "test_note")
    private String testNote;
    
    @Column(name = "test_date")
    private Date testDate;

    private String approver;
    
    @Column(name = "approve_note")
    private String approveNote;
    
    @Column(name = "approve_date")
    private Date approveDate;

    private String no;
    
    private String co;

    @Column(name = "recipe_no")
    private String recipeNo;
    
    private BigDecimal amount;
    
    private String category;

    @Column(name = "company_id")
    private String companyID;

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
