package com.quanlyduongsat.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quanlyduongsat.entity.Company;
import com.quanlyduongsat.repository.CompanyRepository;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping(value="/company/list")
    public ResponseEntity<?> getCompanyList() {
        return ResponseEntity.ok().body(companyRepository.findAll());
    }

    @GetMapping(value="/company")
    public ResponseEntity<?> getCompanyInfo(@RequestParam String companyID) {
        Optional<Company> companyOptional = companyRepository.findByCompanyID(companyID);
        if (!companyOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Company not found!!!");
        }
        return ResponseEntity.ok().body(companyOptional.get());
    }

    @PostMapping(value="/company")
    public ResponseEntity<?> addCompany(@RequestBody Company company) {
        return ResponseEntity.ok().body(companyRepository.save(company));
    }

    @PutMapping(value="/company")
    public ResponseEntity<?> updateCompany(@RequestBody Company company) {
        return ResponseEntity.ok().body(companyRepository.save(company));
    }

}
