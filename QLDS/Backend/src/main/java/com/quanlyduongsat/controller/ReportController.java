package com.quanlyduongsat.controller;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.tomcat.util.http.fileupload.ByteArrayOutputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quanlyduongsat.entity.Company;
import com.quanlyduongsat.entity.Engine;
import com.quanlyduongsat.entity.EngineAnalysisDetail;
import com.quanlyduongsat.entity.EngineAnalysisInfo;
import com.quanlyduongsat.entity.Material;
import com.quanlyduongsat.entity.OrderDetail;
import com.quanlyduongsat.entity.OrderInfo;
import com.quanlyduongsat.entity.ScrapClassifyDetail;
import com.quanlyduongsat.entity.Stock;
import com.quanlyduongsat.entity.TestRecipe;
import com.quanlyduongsat.model.Order;
import com.quanlyduongsat.repository.CategoryRepository;
import com.quanlyduongsat.repository.CompanyRepository;
import com.quanlyduongsat.repository.EngineAnalysisDetailRepository;
import com.quanlyduongsat.repository.EngineAnalysisInfoRepository;
import com.quanlyduongsat.repository.EngineRepository;
import com.quanlyduongsat.repository.MaterialRepository;
import com.quanlyduongsat.repository.OrderDetailRepository;
import com.quanlyduongsat.repository.OrderInfoRepository;
import com.quanlyduongsat.repository.OtherConsumerRepository;
import com.quanlyduongsat.repository.ScrapClassifyDetailRepository;
import com.quanlyduongsat.repository.StockRepository;
import com.quanlyduongsat.repository.SupplierRepository;
import com.quanlyduongsat.repository.TestRecipeRepository;
import com.quanlyduongsat.util.QLDSUtils;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class ReportController {

    @Autowired
    private OrderInfoRepository orderInfoRepository;

    @Autowired
    private TestRecipeRepository testRecipeRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private EngineRepository engineRepository;

    @Autowired
    private EngineAnalysisInfoRepository engineAnalysisInfoRepository;

    @Autowired
    private EngineAnalysisDetailRepository engineAnalysisDetailRepository;

    @Autowired
    private ScrapClassifyDetailRepository scrapClassifyDetailRepository;

    @Autowired
    private OtherConsumerRepository otherConsumerRepository;

    private DecimalFormat df = new DecimalFormat("#,###");

    @GetMapping(value="/report/order/{orderID}/test/recipe")
    public ResponseEntity<?> getTestRecipe(@PathVariable Long orderID) {
        Optional<OrderInfo> orderInfoOptional = orderInfoRepository.findById(orderID);
        if (!orderInfoOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("There is no order with this id");
        }
        Optional<TestRecipe> testRecipeOptional = testRecipeRepository.findByOrderID(orderID);
        if (!testRecipeOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("There is no order with this id");
        }

        byte[] testRecipeData;
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();

            OrderInfo orderInfo = orderInfoOptional.get();
            TestRecipe testRecipe = testRecipeOptional.get();

            Workbook workbook = WorkbookFactory.create(ReportController.class.getClassLoader().getResourceAsStream("Bien_ban_kiem_nghiem.xlsx"));
            Sheet sheet = workbook.getSheetAt(0);

            // Don vi
            Cell companyCell = sheet.getRow(0).getCell(0);
            companyCell.setCellValue(MessageFormat.format(companyCell.getStringCellValue(), companyRepository.findByCompanyID(orderInfo.getCompanyID()).get().getCompanyName()));

            // Ngay - thang - nam
            Cell dateCell = sheet.getRow(7).getCell(0);
            String dateValue = dateCell.getStringCellValue();
            LocalDate today = LocalDate.now();
            int day = today.getDayOfMonth();
            int month = today.getMonthValue();
            int year = today.getYear();
            dateCell.setCellValue(MessageFormat.format(dateValue, new Object[] {Integer.toString(day), Integer.toString(month), Integer.toString(year)}));

            // So
            Cell row8Cell = sheet.getRow(8).getCell(7);
            row8Cell.setCellValue(MessageFormat.format(row8Cell.getStringCellValue(), getOrderNumber(orderInfo)));

            // so hoa don va supplier
            Cell row9Cell = sheet.getRow(9).getCell(0);
            if ("I".equals(orderInfo.getOrderType())) {
                Date recipeDate = orderInfo.getRecipeDate();
                LocalDate localRecipeDate = recipeDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                row9Cell.setCellValue(MessageFormat.format(row9Cell.getStringCellValue(), new Object[] {orderInfo.getRecipeNo(),
                        localRecipeDate.getDayOfMonth(), localRecipeDate.getMonthValue(), localRecipeDate.getYear(),
                        supplierRepository.findBySupplierID(orderInfo.getSupplier()).get().getSupplierName()
                }));
            } else {
                row9Cell.setCellValue("");
            }

            // truong ban
            Cell row11Cell = sheet.getRow(11).getCell(1);
            row11Cell.setCellValue(MessageFormat.format(row11Cell.getStringCellValue(), testRecipe.getLeader(), testRecipe.getLeaderPosition(), testRecipe.getLeaderRepresentation()));
            // Uy vien 1
            Cell row12Cell = sheet.getRow(12).getCell(1);
            row12Cell.setCellValue(MessageFormat.format(row12Cell.getStringCellValue(), testRecipe.getFirstCommissioner(), testRecipe.getFirstCommissionerPosition(), testRecipe.getFirstCommissionerRepresentation()));
            // Uy vien 2
            Cell row13Cell = sheet.getRow(13).getCell(1);
            row13Cell.setCellValue(MessageFormat.format(row13Cell.getStringCellValue(), testRecipe.getSecondCommissioner(), testRecipe.getSecondCommissionerPosition(), testRecipe.getSecondCommissionerRepresentation()));

            int rowNumber = 20;
            Row row = sheet.getRow(rowNumber);
            rowNumber++;

            List<OrderDetail> orderDetailList = orderDetailRepository.findByOrderID(orderID);
            // Thong tin vat lieu nhap kho
            for (int i = 0; i < orderDetailList.size(); i++) {

                sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                Row tmpRow = sheet.createRow(rowNumber);

                Material material = materialRepository.findByMaterialID(orderDetailList.get(i).getMaterialID()).get();

                Cell sttCell = tmpRow.createCell(0);
                sttCell.setCellStyle(row.getCell(1).getCellStyle());
                sttCell.setCellValue(rowNumber - 20);

                Cell materialNameCell = tmpRow.createCell(1);
                materialNameCell.setCellStyle(row.getCell(1).getCellStyle());
                materialNameCell.setCellValue(material.getMaterialName());

                Cell materialIDCell = tmpRow.createCell(2);
                materialIDCell.setCellStyle(row.getCell(2).getCellStyle());
                materialIDCell.setCellValue(material.getMaterialID());

                Cell methodCell = tmpRow.createCell(3);
                methodCell.setCellStyle(row.getCell(3).getCellStyle());
                methodCell.setCellValue("Toàn bộ");

                Cell unitCell = tmpRow.createCell(4);
                unitCell.setCellStyle(row.getCell(4).getCellStyle());
                unitCell.setCellValue(material.getUnit());

                Cell quantityCell = tmpRow.createCell(5);
                quantityCell.setCellStyle(row.getCell(5).getCellStyle());
                quantityCell.setCellValue(orderDetailList.get(i).getRequestQuantity());

                Cell quantityCell2 = tmpRow.createCell(6);
                quantityCell2.setCellStyle(row.getCell(6).getCellStyle());
                quantityCell2.setCellValue(orderDetailList.get(i).getApproveQuantity());

                Cell normalCell1 = tmpRow.createCell(7);
                normalCell1.setCellStyle(row.getCell(7).getCellStyle());
                normalCell1.setCellValue(orderDetailList.get(i).getRequestQuantity() - orderDetailList.get(i).getApproveQuantity());

                Cell normalCell2 = tmpRow.createCell(8);
                normalCell2.setCellStyle(row.getCell(8).getCellStyle());

                rowNumber++;
            }

            rowNumber++;
            rowNumber++;

            // y kien ban kiem nghiem
            Cell commentCell = sheet.getRow(rowNumber).getCell(0);
            commentCell.setCellValue(MessageFormat.format(commentCell.getStringCellValue(), testRecipe.getComment()));

            workbook.write(bos);
            workbook.close();
            testRecipeData = bos.toByteArray();
            bos.close();
        } catch (Exception e) {
            // log exception details and throw custom exception
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

        return ResponseEntity.ok()
                             .header("Content-Disposition", "inline; filename=\"Bien_ban_kiem_nghiem.xlsx\"")
                             .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                             .contentLength(testRecipeData.length)
                             .body(new ByteArrayResource(testRecipeData));
    }

    @GetMapping(value="/report/order/{orderID}/stock-in/recipe")
    public ResponseEntity<?> getStockInOrderRecipe(@PathVariable Long orderID) {
        Optional<OrderInfo> orderInfoOptional = orderInfoRepository.findById(orderID);
        if (!orderInfoOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("There is no order with this id");
        }

        byte[] stockInOrderRecipe;
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            OrderInfo orderInfo = orderInfoOptional.get();
            List<OrderDetail> orderDetailList = orderDetailRepository.findByOrderID(orderID);

            Workbook workbook = WorkbookFactory.create(ReportController.class.getClassLoader().getResourceAsStream("Phieu_nhap_kho.xlsx"));
            Sheet sheet = workbook.getSheetAt(0);

            // Don vi
            Cell companyCell = sheet.getRow(0).getCell(0);
            companyCell.setCellValue(MessageFormat.format(companyCell.getStringCellValue(), companyRepository.findByCompanyID(orderInfo.getCompanyID()).get().getCompanyName()));

            // Ngay - thang - nam
            Cell dateCell = sheet.getRow(5).getCell(0);
            String dateValue = dateCell.getStringCellValue();
            LocalDate today = LocalDate.now();
            int day = today.getDayOfMonth();
            int month = today.getMonthValue();
            int year = today.getYear();
            dateCell.setCellValue(MessageFormat.format(dateValue, new Object[] {Integer.toString(day), Integer.toString(month), Integer.toString(year)}));

            // So
            Cell row6Cell = sheet.getRow(6).getCell(0);
            row6Cell.setCellValue(MessageFormat.format(row6Cell.getStringCellValue(), getOrderNumber(orderInfo)));

            // No
            Cell noCell = sheet.getRow(7).getCell(6);
            noCell.setCellValue(MessageFormat.format(noCell.getStringCellValue(), categoryRepository.findByCategoryID(orderInfo.getNo()).get().getCategoryName()));

            // Co
            Cell coCell = sheet.getRow(8).getCell(6);
            coCell.setCellValue(MessageFormat.format(coCell.getStringCellValue(), categoryRepository.findByCategoryID(orderInfo.getCo()).get().getCategoryName()));

            // Nguoi giao hang
            Cell deliverCell = sheet.getRow(9).getCell(0);
            deliverCell.setCellValue(MessageFormat.format(deliverCell.getStringCellValue(), orderInfo.getDeliver()));

            // so hoa don va supplier
            Cell row10Cell = sheet.getRow(10).getCell(0);
            Date recipeDate = orderInfo.getRecipeDate();
            LocalDate localRecipeDate = recipeDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            row10Cell.setCellValue(MessageFormat.format(row10Cell.getStringCellValue(), new Object[] {orderInfo.getRecipeNo(),
                    localRecipeDate.getDayOfMonth(), localRecipeDate.getMonthValue(), localRecipeDate.getYear(),
                    supplierRepository.findBySupplierID(orderInfo.getSupplier()).get().getSupplierName()}));

            // Address + stockNo
            Cell stockCell = sheet.getRow(11).getCell(0);
            stockCell.setCellValue(MessageFormat.format(stockCell.getStringCellValue(), orderInfo.getStockName(), orderInfo.getAddress()));

            BigDecimal total = new BigDecimal(0);
            int rowNumber = 16;
            Row row = sheet.getRow(rowNumber);
            rowNumber++;

            // Thong tin vat lieu nhap kho
            for (int i = 0; i < orderDetailList.size(); i++) {

                sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                Row tmpRow = sheet.createRow(rowNumber);

                Material material = materialRepository.findByMaterialID(orderDetailList.get(i).getMaterialID()).get();

                Cell sttCell = tmpRow.createCell(0);
                sttCell.setCellStyle(row.getCell(1).getCellStyle());
                sttCell.setCellValue(rowNumber - 16);

                Cell materialNameCell = tmpRow.createCell(1);
                materialNameCell.setCellStyle(row.getCell(1).getCellStyle());
                materialNameCell.setCellValue(material.getMaterialName());

                Cell materialIDCell = tmpRow.createCell(2);
                materialIDCell.setCellStyle(row.getCell(2).getCellStyle());
                materialIDCell.setCellValue(material.getMaterialID());

                Cell unitCell = tmpRow.createCell(3);
                unitCell.setCellStyle(row.getCell(3).getCellStyle());
                unitCell.setCellValue(material.getUnit());

                Cell quantityCell = tmpRow.createCell(4);
                quantityCell.setCellStyle(row.getCell(4).getCellStyle());
                quantityCell.setCellValue(orderDetailList.get(i).getRequestQuantity());

                Cell quantityCell2 = tmpRow.createCell(5);
                quantityCell2.setCellStyle(row.getCell(5).getCellStyle());
                quantityCell2.setCellValue(orderDetailList.get(i).getApproveQuantity());

                Cell priceCell = tmpRow.createCell(6);
                priceCell.setCellStyle(row.getCell(6).getCellStyle());
                BigDecimal priceValue = orderDetailList.get(i).getApproveAmount().divide(new BigDecimal(orderDetailList.get(i).getApproveQuantity()));
                priceCell.setCellValue(df.format(priceValue));

                Cell amountCell = tmpRow.createCell(7);
                amountCell.setCellStyle(row.getCell(7).getCellStyle());
                amountCell.setCellValue(df.format(orderDetailList.get(i).getApproveAmount()));
                total = total.add(orderDetailList.get(i).getApproveAmount());

                rowNumber++;
            }

            rowNumber++;

            Cell totalCell = sheet.getRow(rowNumber).getCell(7);
            totalCell.setCellValue(df.format(total));

            rowNumber++;
            rowNumber++;

            Cell totalInWordCell = sheet.getRow(rowNumber).getCell(0);
            totalInWordCell.setCellValue(MessageFormat.format(totalInWordCell.getStringCellValue(), QLDSUtils.convertNumberToWord(total.longValue())));

            rowNumber++;

            Cell attachedDocumentCell = sheet.getRow(rowNumber).getCell(0);
            attachedDocumentCell.setCellValue(MessageFormat.format(attachedDocumentCell.getStringCellValue(), orderInfo.getAttachedDocument()));

            workbook.write(bos);
            workbook.close();
            bos.close();
            stockInOrderRecipe = bos.toByteArray();
        } catch (Exception e) {
            // log exception details and throw custom exception
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=\"Phieu_nhap_kho.xlsx\"")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .contentLength(stockInOrderRecipe.length)
                .body(new ByteArrayResource(stockInOrderRecipe));
    }

    @GetMapping(value="/report/order/{orderID}/stock-out/recipe")
    public ResponseEntity<?> getStockOutOrderRecipe(@PathVariable Long orderID) {
        Optional<OrderInfo> orderInfoOptional = orderInfoRepository.findById(orderID);
        if (!orderInfoOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("There is no order with this id");
        }

        byte[] stockOutOrderRecipe;
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            OrderInfo orderInfo = orderInfoOptional.get();
            List<OrderDetail> orderDetailList = orderDetailRepository.findByOrderID(orderID);

            Workbook workbook = WorkbookFactory.create(ReportController.class.getClassLoader().getResourceAsStream("Phieu_xuat_kho.xlsx"));
            Sheet sheet = workbook.getSheetAt(0);

            // Don vi
            Cell companyCell = sheet.getRow(0).getCell(0);
            companyCell.setCellValue(MessageFormat.format(companyCell.getStringCellValue(), companyRepository.findByCompanyID(orderInfo.getCompanyID()).get().getCompanyName()));

            // Ngay - thang - nam
            Cell dateCell = sheet.getRow(5).getCell(0);
            String dateValue = dateCell.getStringCellValue();
            LocalDate today = LocalDate.now();
            int day = today.getDayOfMonth();
            int month = today.getMonthValue();
            int year = today.getYear();
            dateCell.setCellValue(MessageFormat.format(dateValue, new Object[] {Integer.toString(day), Integer.toString(month), Integer.toString(year)}));

            // So
            Cell row6Cell = sheet.getRow(6).getCell(0);
            row6Cell.setCellValue(MessageFormat.format(row6Cell.getStringCellValue(), getOrderNumber(orderInfo)));

            // No
            Cell noCell = sheet.getRow(7).getCell(6);
            noCell.setCellValue(MessageFormat.format(noCell.getStringCellValue(), categoryRepository.findByCategoryID(orderInfo.getNo()).get().getCategoryName()));

            // Co
            Cell coCell = sheet.getRow(8).getCell(6);
            coCell.setCellValue(MessageFormat.format(coCell.getStringCellValue(), categoryRepository.findByCategoryID(orderInfo.getCo()).get().getCategoryName()));

            // Ho ten nguoi nhan hang
            Cell deliverCell = sheet.getRow(9).getCell(0);
            deliverCell.setCellValue(MessageFormat.format(deliverCell.getStringCellValue(), orderInfo.getRepairGroup()));

            // Ly do xuat kho
            Cell row10Cell = sheet.getRow(10).getCell(0);
            row10Cell.setCellValue(MessageFormat.format(row10Cell.getStringCellValue(), orderInfo.getRequestNote().concat("-").concat(orderInfo.getConsumer()).concat(" - ").concat(orderInfo.getRepairLevel())));

            // Address + stockNo
            Cell stockCell = sheet.getRow(11).getCell(0);
            stockCell.setCellValue(MessageFormat.format(stockCell.getStringCellValue(), orderInfo.getStockName(), orderInfo.getAddress()));

            BigDecimal total = new BigDecimal(0);
            int rowNumber = 16;
            Row row = sheet.getRow(rowNumber);
            rowNumber++;

            // Thong tin vat lieu nhap kho
            for (int i = 0; i < orderDetailList.size(); i++) {

                sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                Row tmpRow = sheet.createRow(rowNumber);

                Material material = materialRepository.findByMaterialID(orderDetailList.get(i).getMaterialID()).get();

                Cell sttCell = tmpRow.createCell(0);
                sttCell.setCellStyle(row.getCell(1).getCellStyle());
                sttCell.setCellValue(rowNumber - 16);

                Cell materialNameCell = tmpRow.createCell(1);
                materialNameCell.setCellStyle(row.getCell(1).getCellStyle());
                materialNameCell.setCellValue(material.getMaterialName());

                Cell materialIDCell = tmpRow.createCell(2);
                materialIDCell.setCellStyle(row.getCell(2).getCellStyle());
                materialIDCell.setCellValue(material.getMaterialID());

                Cell unitCell = tmpRow.createCell(3);
                unitCell.setCellStyle(row.getCell(3).getCellStyle());
                unitCell.setCellValue(material.getUnit());

                Cell quantityCell = tmpRow.createCell(4);
                quantityCell.setCellStyle(row.getCell(4).getCellStyle());
                quantityCell.setCellValue(orderDetailList.get(i).getRequestQuantity());

                Cell quantityCell2 = tmpRow.createCell(5);
                quantityCell2.setCellStyle(row.getCell(5).getCellStyle());
                quantityCell2.setCellValue(orderDetailList.get(i).getApproveQuantity());

                Cell priceCell = tmpRow.createCell(6);
                priceCell.setCellStyle(row.getCell(6).getCellStyle());
                if (orderDetailList.get(i).getApproveAmount() != null) {
                    BigDecimal priceValue = orderDetailList.get(i).getApproveAmount().divide(new BigDecimal(orderDetailList.get(i).getApproveQuantity()));
                    priceCell.setCellValue(df.format(priceValue));
                    total = total.add(orderDetailList.get(i).getApproveAmount());
                } else {
                    priceCell.setCellValue("");
                }

                Cell amountCell = tmpRow.createCell(7);
                amountCell.setCellStyle(row.getCell(7).getCellStyle());
                if (orderDetailList.get(i).getApproveAmount() != null) {
                    amountCell.setCellValue(df.format(orderDetailList.get(i).getApproveAmount()));
                } else {
                    amountCell.setCellValue("");
                }

                rowNumber++;
            }

            rowNumber++;

            Cell totalCell = sheet.getRow(rowNumber).getCell(7);
            totalCell.setCellStyle(sheet.getRow(rowNumber).getCell(6).getCellStyle());
            if (total.compareTo(new BigDecimal(0)) != 0) {
                totalCell.setCellValue(df.format(total));
            } else {
                totalCell.setCellValue("x");
            }

            rowNumber++;
            rowNumber++;

            Cell totalInWordCell = sheet.getRow(rowNumber).getCell(0);
            if (total.compareTo(new BigDecimal(0)) != 0) {
                totalInWordCell.setCellValue(MessageFormat.format(totalInWordCell.getStringCellValue(), QLDSUtils.convertNumberToWord(total.longValue())));
            } else {
                totalInWordCell.setCellValue(MessageFormat.format(totalInWordCell.getStringCellValue(), ""));
            }

            rowNumber++;

            Cell attachedDocumentCell = sheet.getRow(rowNumber).getCell(0);
            attachedDocumentCell.setCellValue(MessageFormat.format(attachedDocumentCell.getStringCellValue(), orderInfo.getAttachedDocument()));

            workbook.write(bos);
            workbook.close();
            bos.close();
            stockOutOrderRecipe = bos.toByteArray();
        } catch (Exception e) {
            // log exception details and throw custom exception
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=\"Phieu_xuat_kho.xlsx\"")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .contentLength(stockOutOrderRecipe.length)
                .body(new ByteArrayResource(stockOutOrderRecipe));
    }

    private String getOrderNumber(OrderInfo orderInfo) {
        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int year = today.getYear();
        if ("I".equals(orderInfo.getOrderType())) {
            long orderNumber = orderInfoRepository.getOrderNumber(orderInfo.getOrderType(), orderInfo.getCompanyID(), Date.from(Instant.parse(year + "-01-01T00:00:00.000Z")), orderInfo.getUpdatedTimestamp());
            return String.format("%05d", orderNumber).concat("-PN-") + year;
        }
        if ("O".equals(orderInfo.getOrderType())) {
            long orderNumber = orderInfoRepository.getOrderNumber(orderInfo.getOrderType(), orderInfo.getCompanyID(), Date.from(Instant.parse(year + "-" + String.format("%02d", month) + "-01T00:00:00.000Z")), orderInfo.getUpdatedTimestamp());
            return String.format("%05d", orderNumber).concat("-PX-") + month + "-" + year;
        }
        return "";
    }

    @GetMapping(value="/report/stock/list")
    public ResponseEntity<?> getStockList(@RequestParam(required=false, defaultValue="") String companyID) {
        if (companyID.isEmpty()) {
            return ResponseEntity.ok().body(stockRepository.getActiveMaterialListInStock());
        } else {
            return ResponseEntity.ok().body(materialRepository.getMaterialListInStock(companyID));
        }
    }

    @GetMapping(value="/report/order/completed/list")
    public ResponseEntity<?> getOrderList(@RequestParam String companyID, @RequestParam @DateTimeFormat(pattern="dd/MM/yyyy") Date fromDate, @RequestParam @DateTimeFormat(pattern="dd/MM/yyyy") Date toDate) {
        List<Order> orderList = new ArrayList<Order>();
        List<OrderInfo> orderInfoList = orderInfoRepository.getOrderInfoList(companyID, fromDate, toDate);
        for (OrderInfo orderInfo: orderInfoList) {
            orderList.add( new Order(orderInfo, orderDetailRepository.findByOrderID(orderInfo.getId()), null));
        }
        return ResponseEntity.ok().body(orderList);
    }

    @GetMapping(value="/report/engine-analysis")
    public ResponseEntity<?> getEngineAnalysisReport(@RequestParam Long engineAnalysisID) {
        Optional<EngineAnalysisInfo> engineAnalysisInfoOptional = engineAnalysisInfoRepository.findById(engineAnalysisID);
        if (!engineAnalysisInfoOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("There is no engine analysis with this id");
        }

        EngineAnalysisInfo engineAnalysisInfo = engineAnalysisInfoOptional.get();
        List<EngineAnalysisDetail> engineAnalysisDetailList = engineAnalysisDetailRepository.findByEngineAnalysisID(engineAnalysisID);
        Company company = companyRepository.findByCompanyID(engineAnalysisInfo.getCompanyID()).get();
        Engine engine = engineRepository.findByEngineID(engineAnalysisInfo.getEngineID()).get();

        byte[] engineAnalysisRecipe;
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            Workbook workbook = WorkbookFactory.create(ReportController.class.getClassLoader().getResourceAsStream("Bien_ban_giai_the.xlsx"));
            for (int i = 0; i < 6; i++) { // 5 = number of sheet
                String tmpRepairPart = "";
                switch(i) {
                case 0:
                    tmpRepairPart = "phandien";
                  break;
                case 1:
                    tmpRepairPart = "phankhunggam";
                  break;
                case 2:
                    tmpRepairPart = "phandongco";
                  break;
                case 3:
                    tmpRepairPart = "phanham";
                  break;
                case 4:
                    tmpRepairPart = "phancokhi";
                  break;
                case 5:
                    tmpRepairPart = "phantruyendong";
                    break;
                default:
                    tmpRepairPart = "";
                }
                final String repairPart = tmpRepairPart;
                List<EngineAnalysisDetail> filteredComponents = engineAnalysisDetailList.stream().filter(e -> repairPart.equals(e.getPart())).collect(Collectors.toList());

                Sheet sheet = workbook.getSheetAt(i);

                // Company
                Cell companyCell = sheet.getRow(3).getCell(1);
                companyCell.setCellValue(MessageFormat.format(companyCell.getStringCellValue(), company.getCompanyName().toUpperCase()));

                // Date
                Cell dateCell = sheet.getRow(4).getCell(3);
                String dateValue = dateCell.getStringCellValue();
                LocalDate today = LocalDate.now();
                int day = today.getDayOfMonth();
                int month = today.getMonthValue();
                int year = today.getYear();
                dateCell.setCellValue(MessageFormat.format(dateValue, new Object[] {Integer.toString(day), Integer.toString(month), Integer.toString(year)}));

                // engine type
                Cell engineTypeCell = sheet.getRow(7).getCell(1);
                engineTypeCell.setCellValue(MessageFormat.format(engineTypeCell.getStringCellValue(), engine.getEngineType()));

                // engine id
                Cell engineIDCell = sheet.getRow(7).getCell(3);
                engineIDCell.setCellValue(MessageFormat.format(engineIDCell.getStringCellValue(), engine.getEngineID()));

                // repair level
                Cell repairLevelCell = sheet.getRow(8).getCell(1);
                repairLevelCell.setCellValue(MessageFormat.format(repairLevelCell.getStringCellValue(), engineAnalysisInfo.getRepairLevel()));

                // repair date
                Cell repairDateCell = sheet.getRow(8).getCell(3);
                String repairDateString = "";
                try {
                    repairDateString = new SimpleDateFormat("dd/MM/yyyy").format((Date) engineAnalysisInfo.getRepairDate());
                } catch (Exception e) {
                    
                }
                repairDateCell.setCellValue(MessageFormat.format(repairDateCell.getStringCellValue(), repairDateString));

                int rowNumber = 15;
                Row row = sheet.getRow(rowNumber);
                rowNumber++;
                for (EngineAnalysisDetail rowData : filteredComponents) {

                    sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                    Row tmpRow = sheet.createRow(rowNumber);

                    Cell sttCell = tmpRow.createCell(1);
                    sttCell.setCellStyle(row.getCell(1).getCellStyle());
                    sttCell.setCellValue(rowNumber - 15);

                    Material material = materialRepository.findByMaterialID(rowData.getMaterialID()).get();

                    Cell materialIDCell = tmpRow.createCell(2);
                    materialIDCell.setCellStyle(row.getCell(2).getCellStyle());
                    materialIDCell.setCellValue(material.getMaterialID().concat(" - ").concat(material.getMaterialName()));

                    Cell unitCell = tmpRow.createCell(3);
                    unitCell.setCellStyle(row.getCell(3).getCellStyle());
                    unitCell.setCellValue(material.getUnit());

                    Cell quantityCell = tmpRow.createCell(4);
                    quantityCell.setCellStyle(row.getCell(4).getCellStyle());
                    quantityCell.setCellValue(rowData.getQuantity());

                    Cell statusCell = tmpRow.createCell(5);
                    statusCell.setCellStyle(row.getCell(5).getCellStyle());
                    statusCell.setCellValue(rowData.getStatus());

                    Cell measureCell = tmpRow.createCell(6);
                    measureCell.setCellStyle(row.getCell(6).getCellStyle());
                    measureCell.setCellValue(rowData.getMeasure());

                    rowNumber++;
                }
            }

            Sheet sheet = workbook.getSheetAt(6);

            Cell companyCell = sheet.getRow(3).getCell(1);
            companyCell.setCellValue(MessageFormat.format(companyCell.getStringCellValue(), company.getCompanyName().toUpperCase()));

            // Date
            Cell dateCell = sheet.getRow(4).getCell(3);
            String dateValue = dateCell.getStringCellValue();
            LocalDate today = LocalDate.now();
            int day = today.getDayOfMonth();
            int month = today.getMonthValue();
            int year = today.getYear();
            dateCell.setCellValue(MessageFormat.format(dateValue, new Object[] {Integer.toString(day), Integer.toString(month), Integer.toString(year)}));

            int rowNumber = 19;
            Row row = sheet.getRow(rowNumber);
            rowNumber++;
            List<ScrapClassifyDetail> scrapClassifyDetailList = scrapClassifyDetailRepository.findByEngineAnalysisID(engineAnalysisID);
            for (ScrapClassifyDetail rowData : scrapClassifyDetailList) {

                sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                Row tmpRow = sheet.createRow(rowNumber);

                Cell sttCell = tmpRow.createCell(1);
                sttCell.setCellStyle(row.getCell(1).getCellStyle());
                sttCell.setCellValue(rowNumber - 19);

                Material material = materialRepository.findByMaterialID(rowData.getMaterialID()).get();

                Cell materialIDCell = tmpRow.createCell(2);
                materialIDCell.setCellStyle(row.getCell(2).getCellStyle());
                materialIDCell.setCellValue(material.getMaterialID().concat(" - ").concat(material.getMaterialName()));

                Cell unitCell = tmpRow.createCell(3);
                unitCell.setCellStyle(row.getCell(3).getCellStyle());
                unitCell.setCellValue(material.getUnit());

                Cell quantityCell = tmpRow.createCell(4);
                quantityCell.setCellStyle(row.getCell(4).getCellStyle());
                quantityCell.setCellValue(rowData.getQuantity());

                if ("Loại I".equals(rowData.getQuality())) {
                    Cell statusCell = tmpRow.createCell(5);
                    statusCell.setCellStyle(row.getCell(5).getCellStyle());
                    statusCell.setCellValue("x");
                } else {
                    Cell statusCell = tmpRow.createCell(5);
                    statusCell.setCellStyle(row.getCell(5).getCellStyle());
                    statusCell.setCellValue("");
                }

                if ("Loại II".equals(rowData.getQuality())) {
                    Cell statusCell = tmpRow.createCell(6);
                    statusCell.setCellStyle(row.getCell(6).getCellStyle());
                    statusCell.setCellValue("x");
                } else {
                    Cell statusCell = tmpRow.createCell(6);
                    statusCell.setCellStyle(row.getCell(6).getCellStyle());
                    statusCell.setCellValue("");
                }

                if ("Loại III".equals(rowData.getQuality())) {
                    Cell statusCell = tmpRow.createCell(7);
                    statusCell.setCellStyle(row.getCell(7).getCellStyle());
                    statusCell.setCellValue("x");
                } else {
                    Cell statusCell = tmpRow.createCell(7);
                    statusCell.setCellStyle(row.getCell(7).getCellStyle());
                    statusCell.setCellValue("");
                }

                Cell statusCell = tmpRow.createCell(8);
                statusCell.setCellStyle(row.getCell(8).getCellStyle());
                statusCell.setCellValue(rowData.getStatus());

                rowNumber++;
            }

            workbook.write(bos);
            workbook.close();
            bos.close();
            engineAnalysisRecipe = bos.toByteArray();
        } catch (Exception e) {
            // log exception details and throw custom exception
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=\"Bien_ban_giai_the.xlsx\"")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .contentLength(engineAnalysisRecipe.length)
                .body(new ByteArrayResource(engineAnalysisRecipe));
    }

    @GetMapping(value="/report/order/stock-out/completed/list")
    public ResponseEntity<?> getStockOutOrderList(@RequestParam String companyID,
                                                  @RequestParam @DateTimeFormat(pattern="dd/MM/yyyy") Date fromDate,
                                                  @RequestParam @DateTimeFormat(pattern="dd/MM/yyyy") Date toDate) {
        List<Order> orderList = new ArrayList<Order>();
        List<OrderInfo> orderInfoList = orderInfoRepository.getStockOutOrderInfoList(companyID, fromDate, toDate);
        for (OrderInfo orderInfo: orderInfoList) {
            List<OrderDetail> orderDetailList = orderDetailRepository.findByOrderID(orderInfo.getId());
            orderList.add( new Order(orderInfo, orderDetailList, null));
        }
        return ResponseEntity.ok().body(orderList);
    }

    @GetMapping(value="/report/order/stock-in/completed/list")
    public ResponseEntity<?> getStockInOrderList(@RequestParam String companyID,
                                                  @RequestParam @DateTimeFormat(pattern="dd/MM/yyyy") Date fromDate,
                                                  @RequestParam @DateTimeFormat(pattern="dd/MM/yyyy") Date toDate) {
        List<Order> orderList = new ArrayList<Order>();
        List<OrderInfo> orderInfoList = orderInfoRepository.getStockInOrderInfoList(companyID, fromDate, toDate);
        for (OrderInfo orderInfo: orderInfoList) {
            orderList.add( new Order(orderInfo, orderDetailRepository.findByOrderID(orderInfo.getId()), null));
        }
        return ResponseEntity.ok().body(orderList);
    }

    @GetMapping(value="/report/order/stock-in")
    public ResponseEntity<?> getStockInOrderReport(@RequestParam String companyID,
                                                   @RequestParam @DateTimeFormat(pattern="dd/MM/yyyy") Date fromDate,
                                                   @RequestParam @DateTimeFormat(pattern="dd/MM/yyyy") Date toDate,
                                                   @RequestParam(required=false, defaultValue="") String materialTypeID) {
        List<Order> orderList = new ArrayList<Order>();
        List<OrderInfo> orderInfoList = orderInfoRepository.getStockInOrderInfoList(companyID, fromDate, toDate);
        for (OrderInfo orderInfo: orderInfoList) {
            orderList.add( new Order(orderInfo, orderDetailRepository.findByOrderID(orderInfo.getId()), null));
        }
        Company company = companyRepository.findByCompanyID(companyID).get();
        List<Material> materialList = materialRepository.findAll();

        byte[] stockInReport;
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();

            Workbook workbook = WorkbookFactory.create(ReportController.class.getClassLoader().getResourceAsStream("Bao_cao_nhap_kho.xlsx"));
            Sheet sheet = workbook.getSheetAt(0);

            // Don vi
            Cell companyCell = sheet.getRow(0).getCell(0);
            companyCell.setCellValue(MessageFormat.format(companyCell.getStringCellValue(), company.getCompanyName()));

            // Dia chi
            Cell addressCell = sheet.getRow(1).getCell(0);
            addressCell.setCellValue(MessageFormat.format(addressCell.getStringCellValue(), company.getAddress()));

            // Date range
            Cell dateRangeCell = sheet.getRow(4).getCell(0);
            dateRangeCell.setCellValue(MessageFormat.format(dateRangeCell.getStringCellValue(), QLDSUtils.convertDateToString(fromDate), QLDSUtils.convertDateToString(toDate)));

            // Tai khoan kho
            Cell typeCell = sheet.getRow(5).getCell(0);
            Cell typeNameCell = sheet.getRow(6).getCell(0);
            if ("1521".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1521", "Kho nguyên vật liệu chính"));
                typeNameCell.setCellValue(MessageFormat.format(typeNameCell.getStringCellValue(), "Kho nguyên vật liệu chính"));
            } else if ("1522".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1522", "Kho vật liệu xây dựng cơ bản"));
                typeNameCell.setCellValue(MessageFormat.format(typeNameCell.getStringCellValue(), "Kho vật liệu xây dựng cơ bản"));
            } if ("1523".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1523", "Kho dầu mỡ bôi trơn"));
                typeNameCell.setCellValue(MessageFormat.format(typeNameCell.getStringCellValue(), "Kho dầu mỡ bôi trơn"));
            } if ("1524".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1524", "Kho phụ tùng"));
                typeNameCell.setCellValue(MessageFormat.format(typeNameCell.getStringCellValue(), "Kho phụ tùng"));
            } if ("1525".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1525", "Kho nhiên liệu"));
                typeNameCell.setCellValue(MessageFormat.format(typeNameCell.getStringCellValue(), "Kho nhiên liệu"));
            } if ("1526".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1526", "Kho nguyên vật liệu phụ"));
                typeNameCell.setCellValue(MessageFormat.format(typeNameCell.getStringCellValue(), "Kho nguyên vật liệu phụ"));
            } if ("1527".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1527", "Kho phế liệu"));
                typeNameCell.setCellValue(MessageFormat.format(typeNameCell.getStringCellValue(), "Kho phế liệu"));
            } if ("1528".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1528", "Kho phụ tùng gia công cơ khí"));
                typeNameCell.setCellValue(MessageFormat.format(typeNameCell.getStringCellValue(), "Kho phụ tùng gia công cơ khí"));
            } if ("1529".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1529", "Kho nhiên liệu tồn trên phương tiện"));
                typeNameCell.setCellValue(MessageFormat.format(typeNameCell.getStringCellValue(), "Kho nhiên liệu tồn trên phương tiện"));
            } if ("1531".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1531", "Kho công cụ dụng cụ"));
                typeNameCell.setCellValue(MessageFormat.format(typeNameCell.getStringCellValue(), "Kho công cụ dụng cụ"));
            } else {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "Tổng", "Tất cả"));
                typeNameCell.setCellValue(MessageFormat.format(typeNameCell.getStringCellValue(), "Tất cả"));
            }

            Map<String, Map<String, Object>> dataMap = new HashMap<String, Map<String, Object>>();
            for (Order order : orderList) {
                List<OrderDetail> orderDetailList = order.getOrderDetailList();
                for (OrderDetail orderDetail : orderDetailList) {
                    String materialID = orderDetail.getMaterialID();
                    Material selectedMaterial = materialList.stream().filter(e -> e.getMaterialID().equals(materialID)).findFirst().get();
                    if (!materialTypeID.isEmpty() && !selectedMaterial.getMaterialTypeID().equals(materialTypeID)) {
                        continue;
                    }
                    Map<String, Object> record = dataMap.get(materialID);
                    if (record == null) {
                        record = new HashMap<String, Object>();
                        record.put("materialID", materialID);
                        record.put("materialName", selectedMaterial.getMaterialName());
                        record.put("unit", selectedMaterial.getUnit());
                        record.put("requestNote", order.getOrderInfo().getRequestNote());
                        record.put("quantity", 0);
                        record.put("amount", new BigDecimal(0));
                    }
                    record.put("quantity", (Integer) record.get("quantity") + orderDetail.getApproveQuantity());
                    record.put("amount", orderDetail.getApproveAmount().add((BigDecimal) record.get("amount")));
                    dataMap.put(materialID, record);
                }
            }

            int rowNumber = 10;
            Row row = sheet.getRow(rowNumber);
            BigDecimal totalAmount = new BigDecimal(0);
            // Thong tin vat lieu nhap kho
            for (Map.Entry<String, Map<String, Object>> entry : dataMap.entrySet()) {

                sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                Row tmpRow = sheet.createRow(rowNumber);

                Map<String, Object> record = entry.getValue();

                Cell materialIDCell = tmpRow.createCell(0);
                materialIDCell.setCellStyle(row.getCell(0).getCellStyle());
                materialIDCell.setCellValue((String) record.get("materialID"));

                Cell materialNameCell = tmpRow.createCell(1);
                materialNameCell.setCellStyle(row.getCell(1).getCellStyle());
                materialNameCell.setCellValue((String) record.get("materialName"));

                Cell unitCell = tmpRow.createCell(2);
                unitCell.setCellStyle(row.getCell(2).getCellStyle());
                unitCell.setCellValue((String) record.get("unit"));

                Cell requestNoteCell = tmpRow.createCell(3);
                requestNoteCell.setCellStyle(row.getCell(3).getCellStyle());
                requestNoteCell.setCellValue((String) record.get("requestNote"));

                Cell quantityCell = tmpRow.createCell(4);
                quantityCell.setCellStyle(row.getCell(4).getCellStyle());
                quantityCell.setCellValue((Integer) record.get("quantity"));

                Cell priceCell = tmpRow.createCell(5);
                priceCell.setCellStyle(row.getCell(5).getCellStyle());
                priceCell.setCellValue(df.format(((BigDecimal) record.get("amount")).divide(new BigDecimal((Integer) record.get("quantity")))));

                Cell amountCell = tmpRow.createCell(6);
                amountCell.setCellStyle(row.getCell(6).getCellStyle());
                amountCell.setCellValue(df.format((BigDecimal) record.get("amount")));

                Cell extraCell = tmpRow.createCell(7);
                extraCell.setCellStyle(row.getCell(7).getCellStyle());
                extraCell.setCellValue("");

                totalAmount = totalAmount.add((BigDecimal) record.get("amount"));
                rowNumber ++;
            }

            rowNumber++;
            rowNumber++;

            // y kien ban kiem nghiem
            Cell totalCell = sheet.getRow(rowNumber).getCell(6);
            totalCell.setCellValue(df.format(totalAmount));

            workbook.write(bos);
            workbook.close();
            stockInReport = bos.toByteArray();
            bos.close();
        } catch (Exception e) {
            // log exception details and throw custom exception
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

        return ResponseEntity.ok()
                             .header("Content-Disposition", "inline; filename=\"Bao_cao_nhap_kho.xlsx\"")
                             .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                             .contentLength(stockInReport.length)
                             .body(new ByteArrayResource(stockInReport));
    }

    @GetMapping(value="/report/order/stock-out")
    public ResponseEntity<?> getStockOutOrderReport(@RequestParam String companyID,
                                                   @RequestParam @DateTimeFormat(pattern="dd/MM/yyyy") Date fromDate,
                                                   @RequestParam @DateTimeFormat(pattern="dd/MM/yyyy") Date toDate,
                                                   @RequestParam(required=false, defaultValue="") String materialTypeID,
                                                   @RequestParam(required=false, defaultValue="") String consumer,
                                                   @RequestParam(required=false, defaultValue="") String repairLevel,
                                                   @RequestParam(required=false, defaultValue="") String repairGroup,
                                                   @RequestParam(required=false, defaultValue="") String category) {
        List<Order> orderList = new ArrayList<Order>();
        List<OrderInfo> orderInfoList = orderInfoRepository.getStockOutOrderInfoList(companyID, fromDate, toDate);
        for (OrderInfo orderInfo: orderInfoList) {
            orderList.add( new Order(orderInfo, orderDetailRepository.findByOrderID(orderInfo.getId()), null));
        }
        Company company = companyRepository.findByCompanyID(companyID).get();
        List<Material> materialList = materialRepository.findAll();

        byte[] stockInReport;
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();

            Workbook workbook = WorkbookFactory.create(ReportController.class.getClassLoader().getResourceAsStream("Bao_cao_xuat_kho.xlsx"));
            Sheet sheet = workbook.getSheetAt(0);

            // Don vi
            Cell companyCell = sheet.getRow(0).getCell(0);
            companyCell.setCellValue(MessageFormat.format(companyCell.getStringCellValue(), company.getCompanyName()));

            // Dia chi
            Cell addressCell = sheet.getRow(1).getCell(0);
            addressCell.setCellValue(MessageFormat.format(addressCell.getStringCellValue(), company.getAddress()));

            // Date range
            Cell dateRangeCell = sheet.getRow(4).getCell(0);
            dateRangeCell.setCellValue(MessageFormat.format(dateRangeCell.getStringCellValue(), QLDSUtils.convertDateToString(fromDate), QLDSUtils.convertDateToString(toDate)));

            // Khoan muc
            Cell categoryCell = sheet.getRow(5).getCell(0);
            categoryCell.setCellValue(MessageFormat.format(categoryCell.getStringCellValue(), category.isEmpty() ? "Tất cả" : category, category.isEmpty() ? "Tất cả" : categoryRepository.findByCategoryID(category).get().getCategoryName()));

            // Tai khoan kho
            Cell typeCell = sheet.getRow(6).getCell(0);
            if ("1521".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1521", "Kho nguyên vật liệu chính"));
            } else if ("1522".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1522", "Kho vật liệu xây dựng cơ bản"));
            } if ("1523".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1523", "Kho dầu mỡ bôi trơn"));
            } if ("1524".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1524", "Kho phụ tùng"));
            } if ("1525".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1525", "Kho nhiên liệu"));
            } if ("1526".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1526", "Kho nguyên vật liệu phụ"));
            } if ("1527".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1527", "Kho phế liệu"));
            } if ("1528".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1528", "Kho phụ tùng gia công cơ khí"));
            } if ("1529".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1529", "Kho nhiên liệu tồn trên phương tiện"));
            } if ("1531".equals(materialTypeID)) {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "1531", "Kho công cụ dụng cụ"));
            } else {
                typeCell.setCellValue(MessageFormat.format(typeCell.getStringCellValue(), "Tổng", "Tất cả"));
            }

            // Cap sua chua
            Cell repairLevelCell = sheet.getRow(7).getCell(0);
            repairLevelCell.setCellValue(MessageFormat.format(repairLevelCell.getStringCellValue(), repairLevel));

            // Doi tuong tieu thu
            Cell consumerCell = sheet.getRow(8).getCell(0);
            Optional<Engine> engineOptional = engineRepository.findByEngineID(consumer);
            if (engineOptional.isPresent()) {
                consumerCell.setCellValue(MessageFormat.format(consumerCell.getStringCellValue(), consumer));
            } else {
                consumerCell.setCellValue(MessageFormat.format(consumerCell.getStringCellValue(), consumer.isEmpty() ? "" : otherConsumerRepository.findByConsumerID(consumer).get().getConsumerName()));
            }

            Map<String, Map<String, Object>> dataMap = new HashMap<String, Map<String, Object>>();
            for (Order order : orderList) {
                OrderInfo orderInfo = order.getOrderInfo();
                if (!consumer.isEmpty() && !orderInfo.getConsumer().equals(consumer)) {
                    continue;
                }
                if (!category.isEmpty() && !orderInfo.getCategory().equals(category)) {
                    continue;
                }
                if (!repairLevel.isEmpty() && !orderInfo.getRepairLevel().equals(repairLevel)) {
                    continue;
                }
                if (!repairGroup.isEmpty() && !orderInfo.getRepairGroup().equals(repairGroup)) {
                    continue;
                }
                List<OrderDetail> orderDetailList = order.getOrderDetailList();
                for (OrderDetail orderDetail : orderDetailList) {
                    String key = orderDetail.getMaterialID().concat("-").concat(orderInfo.getRepairGroup());
                    String materialID = orderDetail.getMaterialID();
                    Material selectedMaterial = materialList.stream().filter(e -> e.getMaterialID().equals(materialID)).findFirst().get();
                    if (!materialTypeID.isEmpty() && !selectedMaterial.getMaterialTypeID().equals(materialTypeID)) {
                        continue;
                    }
                    Map<String, Object> record = dataMap.get(key);
                    if (record == null) {
                        record = new HashMap<String, Object>();
                        record.put("materialID", materialID);
                        record.put("materialName", selectedMaterial.getMaterialName());
                        record.put("unit", selectedMaterial.getUnit());
                        record.put("quantity", 0);
                        record.put("amount", new BigDecimal(0));
                    }
                    record.put("quantity", (Integer) record.get("quantity") + orderDetail.getApproveQuantity());
                    record.put("amount", (orderDetail.getApproveAmount() == null ? new BigDecimal(0) : orderDetail.getApproveAmount()).add((BigDecimal) record.get("amount")));
                    dataMap.put(key, record);
                }
            }

            int rowNumber = 12;
            Row row = sheet.getRow(rowNumber);
            BigDecimal totalAmount = new BigDecimal(0);

            // Tổ điện
            BigDecimal electricAmount = new BigDecimal(0);
            for (Map.Entry<String, Map<String, Object>> entry : dataMap.entrySet()) {

                String key = entry.getKey();
                if (!key.contains("Tổ Điện")) {
                    continue;
                }

                sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                Row tmpRow = sheet.createRow(rowNumber);

                Map<String, Object> record = entry.getValue();

                Cell materialIDCell = tmpRow.createCell(0);
                materialIDCell.setCellStyle(row.getCell(0).getCellStyle());
                materialIDCell.setCellValue((String) record.get("materialID"));

                Cell materialNameCell = tmpRow.createCell(1);
                materialNameCell.setCellStyle(row.getCell(1).getCellStyle());
                materialNameCell.setCellValue((String) record.get("materialName"));

                Cell unitCell = tmpRow.createCell(2);
                unitCell.setCellStyle(row.getCell(2).getCellStyle());
                unitCell.setCellValue((String) record.get("unit"));

                Cell quantityCell = tmpRow.createCell(3);
                quantityCell.setCellStyle(row.getCell(3).getCellStyle());
                quantityCell.setCellValue((Integer) record.get("quantity"));

                Cell priceCell = tmpRow.createCell(4);
                priceCell.setCellStyle(row.getCell(4).getCellStyle());
                priceCell.setCellValue(df.format(((BigDecimal) record.get("amount")).divide(new BigDecimal((Integer) record.get("quantity")))));

                Cell amountCell = tmpRow.createCell(5);
                amountCell.setCellStyle(row.getCell(5).getCellStyle());
                amountCell.setCellValue(df.format((BigDecimal) record.get("amount")));

                totalAmount = totalAmount.add((BigDecimal) record.get("amount"));
                electricAmount = electricAmount.add((BigDecimal) record.get("amount"));
                rowNumber ++;
            }
            rowNumber++;
            Cell totalElectricCell = sheet.getRow(rowNumber).getCell(5);
            totalElectricCell.setCellValue(df.format(electricAmount));

            // Tổ Động cơ
            rowNumber++;rowNumber++;
            BigDecimal engineAmount = new BigDecimal(0);
            for (Map.Entry<String, Map<String, Object>> entry : dataMap.entrySet()) {

                String key = entry.getKey();
                if (!key.contains("Tổ Động cơ")) {
                    continue;
                }

                sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                Row tmpRow = sheet.createRow(rowNumber);

                Map<String, Object> record = entry.getValue();

                Cell materialIDCell = tmpRow.createCell(0);
                materialIDCell.setCellStyle(row.getCell(0).getCellStyle());
                materialIDCell.setCellValue((String) record.get("materialID"));

                Cell materialNameCell = tmpRow.createCell(1);
                materialNameCell.setCellStyle(row.getCell(1).getCellStyle());
                materialNameCell.setCellValue((String) record.get("materialName"));

                Cell unitCell = tmpRow.createCell(2);
                unitCell.setCellStyle(row.getCell(2).getCellStyle());
                unitCell.setCellValue((String) record.get("unit"));

                Cell quantityCell = tmpRow.createCell(3);
                quantityCell.setCellStyle(row.getCell(3).getCellStyle());
                quantityCell.setCellValue((Integer) record.get("quantity"));

                Cell priceCell = tmpRow.createCell(4);
                priceCell.setCellStyle(row.getCell(4).getCellStyle());
                priceCell.setCellValue(df.format(((BigDecimal) record.get("amount")).divide(new BigDecimal((Integer) record.get("quantity")))));

                Cell amountCell = tmpRow.createCell(5);
                amountCell.setCellStyle(row.getCell(5).getCellStyle());
                amountCell.setCellValue(df.format((BigDecimal) record.get("amount")));

                totalAmount = totalAmount.add((BigDecimal) record.get("amount"));
                engineAmount = engineAmount.add((BigDecimal) record.get("amount"));
                rowNumber ++;
            }
            rowNumber++;
            Cell totalEngineCell = sheet.getRow(rowNumber).getCell(5);
            totalEngineCell.setCellValue(df.format(engineAmount));

            // Tổ hãm
            rowNumber++;rowNumber++;
            BigDecimal breakAmount = new BigDecimal(0);
            for (Map.Entry<String, Map<String, Object>> entry : dataMap.entrySet()) {

                String key = entry.getKey();
                if (!key.contains("Tổ Hãm")) {
                    continue;
                }

                sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                Row tmpRow = sheet.createRow(rowNumber);

                Map<String, Object> record = entry.getValue();

                Cell materialIDCell = tmpRow.createCell(0);
                materialIDCell.setCellStyle(row.getCell(0).getCellStyle());
                materialIDCell.setCellValue((String) record.get("materialID"));

                Cell materialNameCell = tmpRow.createCell(1);
                materialNameCell.setCellStyle(row.getCell(1).getCellStyle());
                materialNameCell.setCellValue((String) record.get("materialName"));

                Cell unitCell = tmpRow.createCell(2);
                unitCell.setCellStyle(row.getCell(2).getCellStyle());
                unitCell.setCellValue((String) record.get("unit"));

                Cell quantityCell = tmpRow.createCell(3);
                quantityCell.setCellStyle(row.getCell(3).getCellStyle());
                quantityCell.setCellValue((Integer) record.get("quantity"));

                Cell priceCell = tmpRow.createCell(4);
                priceCell.setCellStyle(row.getCell(4).getCellStyle());
                priceCell.setCellValue(df.format(((BigDecimal) record.get("amount")).divide(new BigDecimal((Integer) record.get("quantity")))));

                Cell amountCell = tmpRow.createCell(5);
                amountCell.setCellStyle(row.getCell(5).getCellStyle());
                amountCell.setCellValue(df.format((BigDecimal) record.get("amount")));

                totalAmount = totalAmount.add((BigDecimal) record.get("amount"));
                breakAmount = breakAmount.add((BigDecimal) record.get("amount"));
                rowNumber ++;
            }
            rowNumber++;
            Cell totalBreakCell = sheet.getRow(rowNumber).getCell(5);
            totalBreakCell.setCellValue(df.format(breakAmount));

            // Tổ gầm
            rowNumber++;rowNumber++;
            BigDecimal chassisAmount = new BigDecimal(0);
            for (Map.Entry<String, Map<String, Object>> entry : dataMap.entrySet()) {

                String key = entry.getKey();
                if (!key.contains("Tổ Khung Gầm")) {
                    continue;
                }

                sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                Row tmpRow = sheet.createRow(rowNumber);

                Map<String, Object> record = entry.getValue();

                Cell materialIDCell = tmpRow.createCell(0);
                materialIDCell.setCellStyle(row.getCell(0).getCellStyle());
                materialIDCell.setCellValue((String) record.get("materialID"));

                Cell materialNameCell = tmpRow.createCell(1);
                materialNameCell.setCellStyle(row.getCell(1).getCellStyle());
                materialNameCell.setCellValue((String) record.get("materialName"));

                Cell unitCell = tmpRow.createCell(2);
                unitCell.setCellStyle(row.getCell(2).getCellStyle());
                unitCell.setCellValue((String) record.get("unit"));

                Cell quantityCell = tmpRow.createCell(3);
                quantityCell.setCellStyle(row.getCell(3).getCellStyle());
                quantityCell.setCellValue((Integer) record.get("quantity"));

                Cell priceCell = tmpRow.createCell(4);
                priceCell.setCellStyle(row.getCell(4).getCellStyle());
                priceCell.setCellValue(df.format(((BigDecimal) record.get("amount")).divide(new BigDecimal((Integer) record.get("quantity")))));

                Cell amountCell = tmpRow.createCell(5);
                amountCell.setCellStyle(row.getCell(5).getCellStyle());
                amountCell.setCellValue(df.format((BigDecimal) record.get("amount")));

                totalAmount = totalAmount.add((BigDecimal) record.get("amount"));
                chassisAmount = chassisAmount.add((BigDecimal) record.get("amount"));
                rowNumber ++;
            }
            rowNumber++;
            Cell totalChassisCell = sheet.getRow(rowNumber).getCell(5);
            totalChassisCell.setCellValue(df.format(chassisAmount));

            // Tổ cơ khí
            rowNumber++;rowNumber++;
            BigDecimal machanicAmount = new BigDecimal(0);
            for (Map.Entry<String, Map<String, Object>> entry : dataMap.entrySet()) {

                String key = entry.getKey();
                if (!key.contains("Tổ Cơ khí")) {
                    continue;
                }

                sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                Row tmpRow = sheet.createRow(rowNumber);

                Map<String, Object> record = entry.getValue();

                Cell materialIDCell = tmpRow.createCell(0);
                materialIDCell.setCellStyle(row.getCell(0).getCellStyle());
                materialIDCell.setCellValue((String) record.get("materialID"));

                Cell materialNameCell = tmpRow.createCell(1);
                materialNameCell.setCellStyle(row.getCell(1).getCellStyle());
                materialNameCell.setCellValue((String) record.get("materialName"));

                Cell unitCell = tmpRow.createCell(2);
                unitCell.setCellStyle(row.getCell(2).getCellStyle());
                unitCell.setCellValue((String) record.get("unit"));

                Cell quantityCell = tmpRow.createCell(3);
                quantityCell.setCellStyle(row.getCell(3).getCellStyle());
                quantityCell.setCellValue((Integer) record.get("quantity"));

                Cell priceCell = tmpRow.createCell(4);
                priceCell.setCellStyle(row.getCell(4).getCellStyle());
                priceCell.setCellValue(df.format(((BigDecimal) record.get("amount")).divide(new BigDecimal((Integer) record.get("quantity")))));

                Cell amountCell = tmpRow.createCell(5);
                amountCell.setCellStyle(row.getCell(5).getCellStyle());
                amountCell.setCellValue(df.format((BigDecimal) record.get("amount")));

                totalAmount = totalAmount.add((BigDecimal) record.get("amount"));
                machanicAmount = machanicAmount.add((BigDecimal) record.get("amount"));
                rowNumber ++;
            }
            rowNumber++;
            Cell totalMachanicCell = sheet.getRow(rowNumber).getCell(5);
            totalMachanicCell.setCellValue(df.format(chassisAmount));

            // Tổ truyền động
            rowNumber++;rowNumber++;
            BigDecimal transmissionAmount = new BigDecimal(0);
            for (Map.Entry<String, Map<String, Object>> entry : dataMap.entrySet()) {

                String key = entry.getKey();
                if (!key.contains("Tổ Truyền động")) {
                    continue;
                }

                sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                Row tmpRow = sheet.createRow(rowNumber);

                Map<String, Object> record = entry.getValue();

                Cell materialIDCell = tmpRow.createCell(0);
                materialIDCell.setCellStyle(row.getCell(0).getCellStyle());
                materialIDCell.setCellValue((String) record.get("materialID"));

                Cell materialNameCell = tmpRow.createCell(1);
                materialNameCell.setCellStyle(row.getCell(1).getCellStyle());
                materialNameCell.setCellValue((String) record.get("materialName"));

                Cell unitCell = tmpRow.createCell(2);
                unitCell.setCellStyle(row.getCell(2).getCellStyle());
                unitCell.setCellValue((String) record.get("unit"));

                Cell quantityCell = tmpRow.createCell(3);
                quantityCell.setCellStyle(row.getCell(3).getCellStyle());
                quantityCell.setCellValue((Integer) record.get("quantity"));

                Cell priceCell = tmpRow.createCell(4);
                priceCell.setCellStyle(row.getCell(4).getCellStyle());
                priceCell.setCellValue(df.format(((BigDecimal) record.get("amount")).divide(new BigDecimal((Integer) record.get("quantity")))));

                Cell amountCell = tmpRow.createCell(5);
                amountCell.setCellStyle(row.getCell(5).getCellStyle());
                amountCell.setCellValue(df.format((BigDecimal) record.get("amount")));

                totalAmount = totalAmount.add((BigDecimal) record.get("amount"));
                transmissionAmount = transmissionAmount.add((BigDecimal) record.get("amount"));
                rowNumber ++;
            }
            rowNumber++;
            Cell totalTransmissionCell = sheet.getRow(rowNumber).getCell(5);
            totalTransmissionCell.setCellValue(df.format(chassisAmount));

            rowNumber++;
            rowNumber++;

            // y kien ban kiem nghiem
            Cell totalCell = sheet.getRow(rowNumber).getCell(5);
            totalCell.setCellValue(df.format(totalAmount));

            rowNumber++;
            rowNumber++;

            Cell dateCell = sheet.getRow(rowNumber).getCell(0);
            String dateValue = dateCell.getStringCellValue();
            LocalDate today = LocalDate.now();
            int day = today.getDayOfMonth();
            int month = today.getMonthValue();
            int year = today.getYear();
            dateCell.setCellValue(MessageFormat.format(dateValue, new Object[] {Integer.toString(day), Integer.toString(month), Integer.toString(year)}));

            workbook.write(bos);
            workbook.close();
            stockInReport = bos.toByteArray();
            bos.close();
        } catch (Exception e) {
            // log exception details and throw custom exception
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

        return ResponseEntity.ok()
                             .header("Content-Disposition", "inline; filename=\"Bao_cao_xuat_kho.xlsx\"")
                             .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                             .contentLength(stockInReport.length)
                             .body(new ByteArrayResource(stockInReport));
    }

    @GetMapping(value="/report/order")
    public ResponseEntity<?> getOrderReport(@RequestParam String companyID,
                                            @RequestParam @DateTimeFormat(pattern="dd/MM/yyyy") Date fromDate,
                                            @RequestParam @DateTimeFormat(pattern="dd/MM/yyyy") Date toDate) {
        Map<String, Map<String, Object>> fromDateMap = getOrderDetails(companyID, fromDate, new Date());
        Map<String, Map<String, Object>> toDateMap = getOrderDetails(companyID, toDate, new Date());
        List<Stock> stockList = stockRepository.findByCompanyIDAndStatus(companyID, "A");
        Company company = companyRepository.findByCompanyID(companyID).get();
        byte[] orderReport;

        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            Workbook workbook = WorkbookFactory.create(ReportController.class.getClassLoader().getResourceAsStream("Bao_cao_xuat_nhap_ton.xlsx"));
            Sheet sheet = workbook.getSheetAt(0);

            // Don vi
            Cell companyCell = sheet.getRow(0).getCell(0);
            companyCell.setCellValue(MessageFormat.format(companyCell.getStringCellValue(), company.getCompanyName()));

            // Dia chi
            Cell addressCell = sheet.getRow(1).getCell(0);
            addressCell.setCellValue(MessageFormat.format(addressCell.getStringCellValue(), company.getAddress()));

            // Date range
            Cell dateRangeCell = sheet.getRow(4).getCell(0);
            dateRangeCell.setCellValue(MessageFormat.format(dateRangeCell.getStringCellValue(), QLDSUtils.convertDateToString(fromDate), QLDSUtils.convertDateToString(toDate)));

            Map<String, Material> materialMap = new HashMap<String, Material>();
            List<Map<String, Object>> records = new ArrayList<Map<String, Object>>();
            for (Map.Entry<String, Map<String, Object>> entry : fromDateMap.entrySet()) {

                String key = entry.getKey();

                Map<String, Object> fromRecord = entry.getValue();

                Map<String, Object> toRecord = toDateMap.get(key);
                Optional<Stock> stockRecordOptional = stockList.stream().filter(e -> e.getMaterialID().equals(key)).findFirst();

                BigDecimal stockAmount = stockRecordOptional.isPresent() ? stockRecordOptional.get().getAmount() : new BigDecimal(0);
                Integer stockQuantity = stockRecordOptional.isPresent() ? stockRecordOptional.get().getQuantity() : 0;

                Integer fromInQuantity = fromRecord.get("in_quantity") == null ? 0 : (Integer) fromRecord.get("in_quantity");
                Integer fromOutQuantity = fromRecord.get("out_quantity") == null ? 0 : (Integer) fromRecord.get("out_quantity");
                BigDecimal fromInAmount = fromRecord.get("in_amount") == null ? new BigDecimal(0) : (BigDecimal) fromRecord.get("in_amount");
                BigDecimal fromOutAmount = fromRecord.get("out_amount") == null ? new BigDecimal(0) : (BigDecimal) fromRecord.get("out_amount");

                Integer toInQuantity = 0;
                if (toRecord != null && toRecord.get("in_quantity") != null) {
                    toInQuantity = (Integer) toRecord.get("in_quantity");
                }

                Integer toOutQuantity = 0;
                if (toRecord != null && toRecord.get("out_quantity") != null) {
                    toOutQuantity = (Integer) toRecord.get("out_quantity");
                }

                BigDecimal toInAmount = new BigDecimal(0);
                BigDecimal toOutAmount = new BigDecimal(0);

                if (toRecord != null && toRecord.get("in_amount") != null) {
                    toInAmount = (BigDecimal) toRecord.get("in_amount");
                }
                if (toRecord != null && toRecord.get("out_amount") != null) {
                    toOutAmount = (BigDecimal) toRecord.get("out_amount");
                }

                Map<String, Object> record = new HashMap<String, Object>();

                if (!materialMap.containsKey(key)) {
                    materialMap.put(key, materialRepository.findByMaterialID(key).get());
                }
                Material material = materialMap.get(key);

                record.put("materialID", fromRecord.get("materialID"));
                record.put("materialName", material.getMaterialName());
                record.put("unit", material.getUnit());
                record.put("from_remain_quantity", stockQuantity + fromOutQuantity - fromInQuantity);
                record.put("from_remain_amount", stockAmount.subtract(fromInAmount).add(fromOutAmount));
                record.put("in_quantity", fromInQuantity - toInQuantity);
                record.put("in_amount", fromInAmount.subtract(toInAmount));
                record.put("out_quantity", fromOutQuantity - toOutQuantity);
                record.put("out_amount", fromOutAmount.subtract(toOutAmount));
                record.put("to_remain_quantity", stockQuantity + toOutQuantity - toInQuantity);
                record.put("to_remain_amount", stockAmount.subtract(toInAmount).add(toOutAmount));
                records.add(record);
            }

            int rowNumber = 10;
            Row row = sheet.getRow(rowNumber);
            rowNumber++;

            BigDecimal totalIn = new BigDecimal(0);
            BigDecimal totalOut = new BigDecimal(0);

            for (Map<String, Object> rowData : records) {

                sheet.shiftRows(rowNumber, sheet.getLastRowNum(), 1, true, true);
                Row tmpRow = sheet.createRow(rowNumber);

                Cell materialIDCell = tmpRow.createCell(0);
                materialIDCell.setCellStyle(row.getCell(0).getCellStyle());
                materialIDCell.setCellValue((String) rowData.get("materialID"));

                Cell materialNameCell = tmpRow.createCell(1);
                materialNameCell.setCellStyle(row.getCell(1).getCellStyle());
                materialNameCell.setCellValue((String) rowData.get("materialName"));

                Cell unitCell = tmpRow.createCell(2);
                unitCell.setCellStyle(row.getCell(2).getCellStyle());
                unitCell.setCellValue((String) rowData.get("unit"));

                Cell fromRemainQuantityCell = tmpRow.createCell(3);
                fromRemainQuantityCell.setCellStyle(row.getCell(3).getCellStyle());
                fromRemainQuantityCell.setCellValue((Integer) rowData.get("from_remain_quantity"));

                Cell fromRemainAmountCell = tmpRow.createCell(4);
                fromRemainAmountCell.setCellStyle(row.getCell(4).getCellStyle());
                fromRemainAmountCell.setCellValue(df.format((BigDecimal) rowData.get("from_remain_amount")));

                if (rowData.get("in_quantity") != null) {
                    Cell inQuantityCell = tmpRow.createCell(5);
                    inQuantityCell.setCellStyle(row.getCell(5).getCellStyle());
                    inQuantityCell.setCellValue((Integer) rowData.get("in_quantity"));

                    Cell inAmountCell = tmpRow.createCell(6);
                    inAmountCell.setCellStyle(row.getCell(6).getCellStyle());
                    inAmountCell.setCellValue(df.format((BigDecimal) rowData.get("in_amount")));

                    totalIn = totalIn.add((BigDecimal) rowData.get("in_amount"));
                }

                if (rowData.get("out_quantity") != null) {
                    Cell outQuantityCell = tmpRow.createCell(7);
                    outQuantityCell.setCellStyle(row.getCell(7).getCellStyle());
                    outQuantityCell.setCellValue((Integer) rowData.get("out_quantity"));

                    Cell outAmountCell = tmpRow.createCell(8);
                    outAmountCell.setCellStyle(row.getCell(8).getCellStyle());
                    outAmountCell.setCellValue(df.format((BigDecimal) rowData.get("out_amount")));
                    totalOut = totalOut.add((BigDecimal) rowData.get("out_amount"));
                }

                Cell toRemainQuantityCell = tmpRow.createCell(9);
                toRemainQuantityCell.setCellStyle(row.getCell(9).getCellStyle());
                toRemainQuantityCell.setCellValue((Integer) rowData.get("to_remain_quantity"));

                Cell toRemainAmountCell = tmpRow.createCell(10);
                toRemainAmountCell.setCellStyle(row.getCell(10).getCellStyle());
                toRemainAmountCell.setCellValue(df.format((BigDecimal) rowData.get("to_remain_amount")));

                rowNumber++;
            }

            rowNumber++;

            Cell totalInCell = sheet.getRow(rowNumber).getCell(6);
            totalInCell.setCellValue(df.format(totalIn));

            Cell totalOutCell = sheet.getRow(rowNumber).getCell(8);
            totalOutCell.setCellValue(df.format(totalOut));

            rowNumber++;
            rowNumber++;

            Cell dateCell = sheet.getRow(rowNumber).getCell(0);
            String dateValue = dateCell.getStringCellValue();
            LocalDate today = LocalDate.now();
            int day = today.getDayOfMonth();
            int month = today.getMonthValue();
            int year = today.getYear();
            dateCell.setCellValue(MessageFormat.format(dateValue, new Object[] {Integer.toString(day), Integer.toString(month), Integer.toString(year)}));

            workbook.write(bos);
            workbook.close();
            orderReport = bos.toByteArray();
            bos.close();
        } catch (Exception e) {
            // log exception details and throw custom exception
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
        return ResponseEntity.ok()
                .header("Content-Disposition", "inline; filename=\"Bao_cao_xuat_nhap_ton.xlsx\"")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .contentLength(orderReport.length)
                .body(new ByteArrayResource(orderReport));
    }

    private Map<String, Map<String, Object>> getOrderDetails(String companyID, Date fromdate, Date toDate) {
        Map<String, Map<String, Object>> dataMap = new HashMap<String, Map<String, Object>>();
        List<OrderInfo> completedOrderInfoList = orderInfoRepository.getCompletedOrderInfoList(companyID, fromdate, toDate);
        for (OrderInfo completedOrderInfo : completedOrderInfoList) {
            List<OrderDetail> orderDetailList = orderDetailRepository.findByOrderID(completedOrderInfo.getId());
            for (OrderDetail orderDetail : orderDetailList) {
                Map<String, Object> rowData = new HashMap<String, Object>();
                String materialID = orderDetail.getMaterialID();
                if (dataMap.containsKey(materialID)) {
                    rowData = dataMap.get(materialID);
                } else {
                    rowData.put("materialID", materialID);
                    rowData.put("in_quantity", 0);
                    rowData.put("in_amount", new BigDecimal(0));
                    rowData.put("out_quantity", 0);
                    rowData.put("out_amount", new BigDecimal(0));
                }
                if ("I".equals(completedOrderInfo.getOrderType())) {
                    rowData.put("in_quantity", orderDetail.getApproveQuantity() + (Integer) rowData.get("in_quantity"));
                    rowData.put("in_amount", ((BigDecimal) rowData.get("in_amount")).add(orderDetail.getApproveAmount()));
                } else {
                    rowData.put("out_quantity", orderDetail.getApproveQuantity() + (Integer) rowData.get("out_quantity"));
                    rowData.put("out_amount", ((BigDecimal) rowData.get("out_amount")).add(orderDetail.getApproveAmount() == null ?new BigDecimal(0) : orderDetail.getApproveAmount()));
                }
                dataMap.put(materialID, rowData);
            }
        }
        return dataMap;
    }

}
