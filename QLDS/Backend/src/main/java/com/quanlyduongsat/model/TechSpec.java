package com.quanlyduongsat.model;

import java.util.List;

import com.quanlyduongsat.entity.Spec;
import com.quanlyduongsat.entity.SpecStandard;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TechSpec {

    private Spec spec;
    private List<SpecStandard> specStandardList;

}
