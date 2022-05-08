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
@Table(name = "material", uniqueConstraints = { @UniqueConstraint(columnNames = "material_id") })
@Getter @Setter @NoArgsConstructor @RequiredArgsConstructor @AllArgsConstructor
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    @NotBlank
    @Column(name = "material_id")
    private String materialID;

    @NonNull
    @NotBlank
    @Column(name = "material_name")
    private String materialName;

    private String unit;

    @Column(name = "product_code")
    private String productCode;

    @Column(name = "material_group_id")
    private String materialGroupID;

    @Column(name = "material_group_name")
    private String materialGroupName;

    @Column(name = "material_type_id")
    private String materialTypeID;

    @Column(name = "material_type_name")
    private String materialTypeName;

    @Column(name = "spec_id")
    private String specID;

    @Column(name = "minimum_quantity")
    private String minimumQuantity;

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
