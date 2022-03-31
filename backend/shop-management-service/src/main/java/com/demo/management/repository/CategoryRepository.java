package com.demo.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.demo.management.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

}
