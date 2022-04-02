package com.demo.main.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import com.demo.main.model.Condition;
import com.demo.main.model.OrderRecord;
import com.demo.main.model.ProductInfo;
import com.demo.main.model.SpecDetail;

@Repository
public class MainRepoImpl implements MainRepo {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<ProductInfo> findProductsByConditions(Long categoryID, List<Condition> filterConditions, Integer minPrice, Integer maxPrice, Integer pageNumber, Integer pageSize, String sortColumn, String sortOrder) {
        String rawQuery = "select distinct p.id, product_name, c.category_name, description, selling_price, s.quantity from " +
                          "shop.products p left join shop.categories c on p.category_id = c.id " +
                          "left join shop.stocks s on p.id = s.product_id " +
                          "left join shop.spec_standard ss on p.spec_id = ss.spec_id " +
                          "where p.selling_price between :minPrice and :maxPrice ";
        if (categoryID != null) {
            rawQuery += " and category_id = :categoryID ";
        }
        if (!CollectionUtils.isEmpty(filterConditions)) {
            rawQuery += " and concat(ss.standard_id, '_', ss.standard_value) in ( :filterSet ) ";
        }
        // rawQuery += " order by " + sortColumn;
        Query query = entityManager.createNativeQuery(rawQuery);
        if (categoryID != null) {
            query.setParameter("categoryID", categoryID);
        }
        if (!CollectionUtils.isEmpty(filterConditions)) {
            query.setParameter("filterSet", filterConditions.stream().map(e -> e.getStandardID() + "_" + e.getStandardValue()).collect(Collectors.joining(", ")));
        }
        query.setParameter("minPrice", minPrice);
        query.setParameter("maxPrice", maxPrice);
        query.setFirstResult((pageNumber-1) * pageSize); 
        query.setMaxResults(pageSize);
        @SuppressWarnings("unchecked")
        List<Object[]> products = query.getResultList();
        return products.stream().map(e -> new ProductInfo(Long.valueOf((Integer) e[0]), (String) e[1], (String) e[2], (String) e[3], (BigDecimal) e[4], (Integer) e[5])).collect(Collectors.toList());
    }

    @Override
    public List<SpecDetail> findSpecDetailsBySpecID(Long specID) {
        String rawQuery = "select ss.id, spec_id, standard_id, s.standard_name, ss.standard_value from shop.spec_standard ss join shop.standards s on ss.standard_id = s.id where ss.spec_id = :specID";
        Query query = entityManager.createNativeQuery(rawQuery);
        query.setParameter("specID", specID);
        @SuppressWarnings("unchecked")
        List<Object[]> specDetails = query.getResultList();
        return specDetails.stream().map(e -> new SpecDetail(Long.valueOf((Integer) e[0]), Long.valueOf((Integer) e[1]), Long.valueOf((Integer) e[2]), (String) e[3], (String) e[4])).collect(Collectors.toList());
    }

    @Override
    public List<OrderRecord> getOrderDetailsByOrderID(Long orderID, String status) {
        String rawQuery = "select od.id, product_id, product_name, selling_price, quantity from " + 
                          "shop.order_details od left join shop.orders o on od.order_id = o.id " +
                          "left join shop.products p on od.product_id = p.id " +
                          "where od.order_id = :orderID ";
        if (StringUtils.hasText(status)) {
            rawQuery += "and od.status = :status";
        }
        Query query = entityManager.createNativeQuery(rawQuery);
        query.setParameter("orderID", orderID);
        if (StringUtils.hasText(status)) {
            query.setParameter("status", status);
        }
        @SuppressWarnings("unchecked")
        List<Object[]> orderRecordList = query.getResultList();
        return orderRecordList.stream().map(e -> new OrderRecord(Long.valueOf((Integer) e[0]), Long.valueOf((Integer) e[1]), (String) e[2], (BigDecimal) e[3], (Integer) e[4])).collect(Collectors.toList());
    }

}
