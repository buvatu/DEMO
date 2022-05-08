package com.quanlyduongsat.entity;

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

import org.springframework.security.core.context.SecurityContextHolder;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor @RequiredArgsConstructor @AllArgsConstructor
@Table(name = "supplier", uniqueConstraints = { @UniqueConstraint(columnNames = "supplier_id") })
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    @NotBlank
    @Column(name = "supplier_id")
    private String supplierID;

    @NonNull
    @Column(name = "supplier_name")
    private String supplierName;

    @Column(name = "tax_code")
    private String taxCode;

    @Column(name = "phone_number")
    private String phoneNumber;

    private String address;

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
