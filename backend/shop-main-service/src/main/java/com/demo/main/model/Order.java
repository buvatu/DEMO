package com.demo.main.model;

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
    @Size(max = 200)
    @Column(name = "order_name")
    private String orderName;

    @NonNull
    @NotBlank
    @Size(max = 200)
    @Column(name = "username")
    private String username;

    @NonNull
    @NotBlank
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
        updatedUser = (String) RequestContextHolder.getRequestAttributes().getAttribute("currentLoggedInUser", RequestAttributes.SCOPE_REQUEST);
    }

    public Order(String orderName, String username, String status) {
        this.orderName = orderName;
        this.username = username;
        this.status = status;
    }

}
