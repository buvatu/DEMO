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
import javax.validation.constraints.NotBlank;

import org.springframework.security.core.context.SecurityContextHolder;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "order_info")
public class OrderInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    @NotBlank
    @Column(name = "order_name")
    private String orderName;

    @NonNull
    @NotBlank
    @Column(name = "order_type")
    private String orderType;

    private String status;

    private String requestor;
    @Column(name = "request_note")
    private String requestNote;
    @Column(name = "request_date")
    private Date requestDate;

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

    private String supplier;

    private String no;
    private String co;

    @Column(name = "recipe_no")
    private String recipeNo;
    @Column(name = "recipe_date")
    private Date recipeDate;

    private String deliver;

    @Column(name = "attached_document")
    private String attachedDocument;

    @Column(name = "stock_name")
    private String stockName;

    private String address;
    private String category;

    private String consumer;
    @Column(name = "repair_level")
    private String repairLevel;
    @Column(name = "repair_group")
    private String repairGroup;

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
