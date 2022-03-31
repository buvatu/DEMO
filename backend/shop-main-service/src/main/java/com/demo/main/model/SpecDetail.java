package com.demo.main.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SpecDetail {

    private Long id;
    private Long specID;
    private Long standardID;
    private String standardName;
    private String standardValue;

}
