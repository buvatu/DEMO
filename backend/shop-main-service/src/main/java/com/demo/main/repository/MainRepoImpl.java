package com.demo.main.repository;

import java.util.List;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

import com.demo.main.model.Condition;
import com.demo.main.model.ProductInfo;
import com.demo.main.model.SpecDetail;

public class MainRepoImpl implements MainRepo {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<ProductInfo> findProductsByConditions(Long categoryID, List<Condition> filterConditions, Integer pageNumber, Integer pageSize) {
        String rawQuery = "select p.id, product_name, category_id, c.category name, description, selling_price, quantity from " +
                          "((products p left join category c on p.category_id = c.id) " +
                          "left join stocks s on p.id = s.product_id) " +
                          "left join spec_standatd ss on p.spec_id = ss.spec_id " +
                          "where 1 = 1 ";
        if (categoryID != null) {
            rawQuery += " and category_id = :category_id ";
        }
        if (!filterConditions.isEmpty()) {
            rawQuery += " and concat(ss.standard_id, '_', 'ss.standard_vlue') in ( :filterSet ) ";
        }
        rawQuery += "limit :pageSize offset :skippedRowNumber order by p.selling_price ";
        TypedQuery<Object[]> query = entityManager.createQuery(rawQuery, Object[].class);
        if (categoryID != null) {
            query.setParameter("category_id", categoryID);
        }
        if (!filterConditions.isEmpty()) {
            query.setParameter("category_id", filterConditions.stream().map(e -> e.getStandardID() + "_" + e.getStandardValue()).collect(Collectors.joining(", ")));
        }
        query.setParameter("pageSize", pageSize);
        query.setParameter("skippedRowNumber", pageNumber * pageSize);
        return query.getResultList().stream().map(e -> new ProductInfo()).collect(Collectors.toList());
    }

    @Override
    public List<SpecDetail> findSpecDetailsBySpecID(Long specID) {
        TypedQuery<Object[]> query = entityManager.createQuery("select id, spec_id, standard_id, standard_name, standard_value from spec_standard ss join standards s on ss.standard_id = s.id where spec_id = :specID", Object[].class);
        query.setParameter("specID", specID);
        return query.getResultList().stream().map(e -> new SpecDetail((Long) e[0], (Long) e[1], (Long) e[2], (String) e[3], (String) e[4])).collect(Collectors.toList());
    }

}
