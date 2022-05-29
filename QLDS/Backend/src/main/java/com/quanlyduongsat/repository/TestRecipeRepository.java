package com.quanlyduongsat.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.TestRecipe;

@Repository
public interface TestRecipeRepository extends JpaRepository<TestRecipe, Long> {

    Optional<TestRecipe> findByOrderID(Long orderID);

}
