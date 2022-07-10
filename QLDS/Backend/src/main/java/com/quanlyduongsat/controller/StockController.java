package com.quanlyduongsat.controller;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quanlyduongsat.entity.Material;
import com.quanlyduongsat.entity.OrderDetail;
import com.quanlyduongsat.entity.OrderInfo;
import com.quanlyduongsat.entity.Price;
import com.quanlyduongsat.entity.Stock;
import com.quanlyduongsat.repository.MaterialRepository;
import com.quanlyduongsat.repository.OrderDetailRepository;
import com.quanlyduongsat.repository.OrderInfoRepository;
import com.quanlyduongsat.repository.PriceRepository;
import com.quanlyduongsat.repository.StockRepository;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class StockController {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private OrderInfoRepository orderInfoRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private PriceRepository priceRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @PutMapping(value="/stock/update") @Transactional
    public ResponseEntity<?> stockUpdate(@RequestParam String companyID, @RequestBody List<Stock> updatedStockList) {
        stockRepository.disableStockByCompanyID(companyID);
        updatedStockList.forEach(e -> e.setStatus("A"));
        for (Stock stock : updatedStockList) {
            Optional<Stock> currentStockOptional = stockRepository.findByCompanyIDAndMaterialID(companyID, stock.getMaterialID());
            if (currentStockOptional.isPresent()) {
                Stock currentStock = currentStockOptional.get();
                currentStock.setQuantity(stock.getQuantity());
                currentStock.setAmount(stock.getAmount());
                currentStock.setStatus("A");
                stockRepository.save(currentStock);
            } else {
                stockRepository.save(stock);
            }
        }
        return ResponseEntity.ok().body("ok");
    }

    @GetMapping(value="/stock/price-adjust/list")
    public ResponseEntity<?> getAdjustPriceList(@RequestParam String companyID, @RequestParam String adjustTime) {// adjustTime is in format yyyy-MM

        String month = adjustTime.split("-")[0];
        String year = adjustTime.split("-")[1];

        // First get adjust time
        Date fromTime = Date.from(Instant.parse(year + "-" + month + "-01T00:00:00.000Z"));
        Date endTime = Date.from(Instant.parse(year + "-" + month + "-" + getLastDayOfMonth(month, year) + "T12:59:59.000Z"));

        // Get all stock in order in this period time
        List<OrderInfo> stockInOrderInfoList = orderInfoRepository.getStockInOrderInfoList(companyID, fromTime, endTime);
        Map<String, BigDecimal> stockInAmountMap = new HashMap<String, BigDecimal>();
        Map<String, Integer> stockInQuantityMap = new HashMap<String, Integer>();
        for (OrderInfo stockInOrderInfo : stockInOrderInfoList) {
            List<OrderDetail> orderDetaiList = orderDetailRepository.findByOrderID(stockInOrderInfo.getId());
            for (OrderDetail orderDetail : orderDetaiList) {
                String materialID = orderDetail.getMaterialID();
                if (!stockInAmountMap.containsKey(materialID)) {
                    stockInAmountMap.put(materialID, new BigDecimal(0));
                }
                if (!stockInQuantityMap.containsKey(materialID)) {
                    stockInQuantityMap.put(materialID, 0);
                }
                stockInAmountMap.put(materialID, stockInAmountMap.get(materialID).add(orderDetail.getApproveAmount()));
                stockInQuantityMap.put(materialID, stockInQuantityMap.get(materialID) + (orderDetail.getApproveQuantity() == null ? 0 : orderDetail.getApproveQuantity()));
            }
        }

        Map<String, BigDecimal> stockInPriceMap = new HashMap<String, BigDecimal>();
        for (Map.Entry<String, BigDecimal> entry : stockInAmountMap.entrySet()) {
            String materialID = entry.getKey();
            BigDecimal totalAmount = entry.getValue();
            Integer totalQuantity = stockInQuantityMap.get(materialID);
            if (totalQuantity == null || totalQuantity == 0) {
                stockInPriceMap.put(materialID, new BigDecimal(0));
            } else {
                stockInPriceMap.put(materialID, totalAmount.divide(new BigDecimal(totalQuantity)));
            }
        }

        List<OrderInfo> stockOutOrderInfoList = orderInfoRepository.getStockOutOrderInfoList(companyID, fromTime, endTime);
        List<String> materialIDList = new ArrayList<String>();
        // Parse the list of materialID that need to adjust price
        for (OrderInfo stockOutOrderInfo : stockOutOrderInfoList) {
            List<OrderDetail> orderDetaiList = orderDetailRepository.findByOrderID(stockOutOrderInfo.getId());
            for (OrderDetail orderDetail : orderDetaiList) {
                String materialID = orderDetail.getMaterialID();
                if (orderDetail.getApproveAmount() != null || materialIDList.contains(materialID)) {
                    continue;
                } else {
                    materialIDList.add(materialID);
                }
            }
        }

        List<Map<String, Object>> records = new ArrayList<Map<String, Object>>();
        for (String materialID : materialIDList) {
            Map<String, Object> recordMap = new HashMap<String, Object>();
            recordMap.put("materialID", materialID);
            Material selectedMaterial = materialRepository.findByMaterialID(materialID).get();
            recordMap.put("materialName", selectedMaterial.getMaterialName());
            recordMap.put("unit", selectedMaterial.getUnit());
            recordMap.put("companyID", companyID);
            recordMap.put("adjustTime", adjustTime);
            if (!stockInPriceMap.containsKey(materialID)) {
                recordMap.put("price", new BigDecimal(0));
            } else {
                recordMap.put("price", stockInPriceMap.get(materialID));
            }
            Optional<Price> lastMonthPrice = priceRepository.findByMaterialIDAndCompanyIDAndAdjustTime(materialID, companyID, getPreviousMonthDate(month, year));
            if (!lastMonthPrice.isPresent()) {
                recordMap.put("lastPrice", new BigDecimal(0));
            } else {
                recordMap.put("lastPrice", lastMonthPrice.get().getPrice());
            }
            records.add(recordMap);
        }

        return ResponseEntity.ok().body(records);
    }

    private String getLastDayOfMonth(String month, String year) {
        if ("01".equals(month) || "03".equals(month) || "05".equals(month) || "07".equals(month) || "08".equals(month) || "10".equals(month) || "12".equals(month)) {
            return "31";
        }
        if ("04".equals(month) || "06".equals(month) || "09".equals(month) || "11".equals(month)) {
            return "30";
        }
        if ("02".equals(month) && Integer.parseInt(year) % 4 == 0) {
            return "29";
        }
        return "28";
    }

    private String getPreviousMonthDate(String month, String year) {
        if ("01".equals(month)) {
            return "12-" + (Integer.parseInt(year) - 1);
        } else {
            return String.valueOf(Integer.parseInt(month) - 1).concat("-").concat(String.valueOf(Integer.parseInt(year)));
        }
    }

    @PutMapping(value="/stock/price/adjust") @Transactional
    public ResponseEntity<?> adjustPrice(@RequestBody List<Price> priceList, @RequestParam String companyID, @RequestParam String adjustTime) {// adjustTime is in format yyyy-MM
        priceRepository.saveAll(priceList);

        String month = adjustTime.split("-")[0];
        String year = adjustTime.split("-")[1];
        // First get adjust time
        Date fromTime = Date.from(Instant.parse(year + "-" + month + "-01T00:00:00.000Z"));
        Date endTime = Date.from(Instant.parse(year + "-" + month + "-" + getLastDayOfMonth(month, year) + "T12:59:59.000Z"));

        List<OrderInfo> stockOutOrderInfoList = orderInfoRepository.getStockOutOrderInfoList(companyID, fromTime, endTime);
        for (OrderInfo stockOutOrderInfo : stockOutOrderInfoList) {
            List<OrderDetail> orderDetaiList = orderDetailRepository.findByOrderID(stockOutOrderInfo.getId());
            for (OrderDetail orderDetail : orderDetaiList) {
                String materialID = orderDetail.getMaterialID();
                if (orderDetail.getApproveAmount() != null) {
                    continue;
                }
                Price price = priceList.stream().filter(e -> e.getMaterialID().equals(materialID)).findFirst().get();
                BigDecimal approveAmount = new BigDecimal(orderDetail.getApproveQuantity()).multiply(price.getPrice());
                orderDetail.setApproveAmount(approveAmount);
                Optional<Stock> stockOptional = stockRepository.findByCompanyIDAndMaterialID(companyID, materialID);
                if (!stockOptional.isPresent()) {
                    continue;
                }
                Stock stock = stockOptional.get();
                stock.setAmount(stock.getAmount().subtract(approveAmount));
                stockRepository.save(stock);
            }
            orderDetailRepository.saveAll(orderDetaiList);
        }

        return ResponseEntity.ok().body("ok");
    }

}
