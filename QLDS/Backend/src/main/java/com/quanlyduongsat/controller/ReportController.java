package com.quanlyduongsat.controller;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.MessageFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.tomcat.util.http.fileupload.ByteArrayOutputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quanlyduongsat.entity.Material;
import com.quanlyduongsat.entity.OrderDetail;
import com.quanlyduongsat.entity.OrderInfo;
import com.quanlyduongsat.entity.TestRecipe;
import com.quanlyduongsat.repository.CategoryRepository;
import com.quanlyduongsat.repository.CompanyRepository;
import com.quanlyduongsat.repository.MaterialRepository;
import com.quanlyduongsat.repository.OrderDetailRepository;
import com.quanlyduongsat.repository.OrderInfoRepository;
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
}
