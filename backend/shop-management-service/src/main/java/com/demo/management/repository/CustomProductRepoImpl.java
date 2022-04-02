package com.demo.management.repository;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.demo.management.entity.Product;

@Repository
public class CustomProductRepoImpl implements CustomProductRepo {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Product> findProductByNameLikeAndCategory(String productName, Long categoryID) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Product> query = cb.createQuery(Product.class);
        Root<Product> product = query.from(Product.class);

        // Custom conditions without using raw query
        List<Predicate> predicates = new ArrayList<Predicate>();
        if (StringUtils.hasText(productName)) {
            predicates.add(cb.like(product.get("productName"), "%".concat(productName).concat("%")));
        }
        if (categoryID != null) {
            predicates.add(cb.equal(product.get("categoryID"), categoryID));
        }

        query.select(product).where(cb.and(predicates.toArray(new Predicate[predicates.size()])));

        return entityManager.createQuery(query).getResultList();

    }

}
