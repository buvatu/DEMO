package com.demo.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.demo.main.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

}
