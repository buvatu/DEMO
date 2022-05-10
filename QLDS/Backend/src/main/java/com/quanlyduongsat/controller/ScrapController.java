package com.quanlyduongsat.controller;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quanlyduongsat.entity.Scrap;
import com.quanlyduongsat.repository.ScrapRepository;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class ScrapController {

    @Autowired
    private ScrapRepository scrapRepository;

    @GetMapping(value="/scrap/list")
    public ResponseEntity<?> getScrapList() {
        return ResponseEntity.ok().body(scrapRepository.findAllByOrderByMaterialNameAsc());
    }

    @PostMapping(value="/scrap")
    public ResponseEntity<?> addScrap(@RequestBody Scrap scrap) {
        return ResponseEntity.ok().body(scrapRepository.save(scrap));
    }

    @DeleteMapping(value="/scrap")
    public ResponseEntity<?> deleteScrap(@RequestParam Long id) {
        scrapRepository.deleteById(id);
        return ResponseEntity.ok().body("ok");
    }

    @PutMapping(value="/scrap")
    public ResponseEntity<?> updateScrap(@RequestBody Scrap scrap) {
        return ResponseEntity.ok().body(scrapRepository.save(scrap));
    }

    @GetMapping(value="/scrap/price/list")
    public ResponseEntity<?> getScrapPrice(@RequestParam String companyID) {
        return ResponseEntity.ok().body(scrapRepository.getScrapPriceList(companyID));
    }

    @PostMapping(value="/scrap/price/adjust") @Transactional
    public ResponseEntity<?> adjustScrapPrice(@RequestParam String copperPrice,
                                              @RequestParam String aluminumPrice,
                                              @RequestParam String castIronPrice,
                                              @RequestParam String steelPrice,
                                              @RequestParam String otherPrice,
                                              @RequestParam String companyID) {
        String updatedUser = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        scrapRepository.disableScrapPrice(companyID);
        scrapRepository.adjustNewScrapPrice(companyID, copperPrice, aluminumPrice, castIronPrice, steelPrice, otherPrice, updatedUser, new Date());
        return ResponseEntity.ok().body("ok");
    }

}
