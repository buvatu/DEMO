package com.demo.management.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.demo.management.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

}
