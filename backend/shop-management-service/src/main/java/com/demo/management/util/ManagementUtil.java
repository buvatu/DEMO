package com.demo.management.util;

import java.math.BigDecimal;

public class ManagementUtil {

    public static BigDecimal getDecimalValueFromString(String inputString) {
        try {
            return new BigDecimal(inputString);
        } catch (Exception e) {
            return null;
        }
    }
}
