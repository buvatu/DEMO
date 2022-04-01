package com.demo.management.model;

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
@Table(name = "spec_standard", uniqueConstraints = { @UniqueConstraint(columnNames = {"spec_id", "standard_id"} ) })
public class SpecStandard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NonNull
    @NotBlank
    @Column(name = "spec_id")
    private Long specID;

    @NonNull
    @NotBlank
    @Column(name = "standard_id")
    private Long standardID;

    @NonNull
    @NotBlank
    @Size(max = 200)
    @Column(name = "standard_value")
    private String standardValue;

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

    public SpecStandard(Long id, Long specID, Long standardID, String standardValue) {
        this.id = id;
        this.specID = specID;
        this.standardID = standardID;
        this.standardValue = standardValue;
    }

    public SpecStandard(Long specID, Long standardID, String standardValue) {
        this.specID = specID;
        this.standardID = standardID;
        this.standardValue = standardValue;
    }
}
