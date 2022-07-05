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

import org.springframework.security.core.context.SecurityContextHolder;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "engine_analysis_detail")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EngineAnalysisDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "engine_analysis_id")
    private Long engineAnalysisID;

    @Column(name = "material_id")
    private String materialID;

    private String part;
    private Long quantity;
    private String status;
    private String measure;

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
