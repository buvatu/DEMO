package com.quanlyduongsat.util;

import java.text.DecimalFormat;

import org.springframework.util.StringUtils;

public class QLDSUtils {

    //string type array for one digit numbers
    private static final String[] twodigits = {"", " mười", " hai mươi", " ba mươi", " bốn mươi", " năm mươi", " sáu mươi", " bảy mươi", " tám mươi", " chín mươi"};  

    //string type array for two digits numbers   
    private static final String[] onedigit = {"", " một", " hai", " ba", " bốn", " năm", " sáu", " bảy", " tám", " chín", " mười", " mười một", " mười hai", " mười ba", " mười bốn", " mười năm", " mười sáu", " mười bảy", " mười tám", " mười chín"};  

    private static String convertUptoThousand(int number) {
        String soFar;
        if (number % 100 < 20) {
            soFar = onedigit[number % 100];
            number = number / 100;
        } else {
            soFar = onedigit[number % 10];
            number = number / 10;
            soFar = twodigits[number % 10] + soFar;
            number = number / 10;
        }
        if (number == 0)
            return soFar;
        return onedigit[number] + " trăm " + soFar;
    }

    // user-defined method that converts a long number (0 to 999999999) to string
    public static String convertNumberToWord(long number) {
        // checks whether the number is zero or not
        if (number == 0) {
            // if the given number is zero it returns zero
            return "không";
        }
        // the toString() method returns a String object that represents the specified
        // long
        String num = Long.toString(number);
        // for creating a mask padding with "0"
        String pattern = "000000000000";
        // creates a DecimalFormat using the specified pattern and also provides the
        // symbols for the default locale
        DecimalFormat decimalFormat = new DecimalFormat(pattern);
        // format a number of the DecimalFormat instance
        num = decimalFormat.format(number);
        // format: XXXnnnnnnnnn
        // the subString() method returns a new string that is a substring of this
        // string
        // the substring begins at the specified beginIndex and extends to the character
        // at index endIndex - 1
        // the parseInt() method converts the string into integer
        int billions = Integer.parseInt(num.substring(0, 3));
        // format: nnnXXXnnnnnn
        int millions = Integer.parseInt(num.substring(3, 6));
        // format: nnnnnnXXXnnn
        int hundredThousands = Integer.parseInt(num.substring(6, 9));
        // format: nnnnnnnnnXXX
        int thousands = Integer.parseInt(num.substring(9, 12));
        String tradBillions;
        switch (billions) {
        case 0:
            tradBillions = "";
            break;
        case 1:
            tradBillions = convertUptoThousand(billions) + " tỉ ";
            break;
        default:
            tradBillions = convertUptoThousand(billions) + " tỉ ";
        }
        String result = tradBillions;
        String tradMillions;
        switch (millions) {
        case 0:
            tradMillions = "";
            break;
        case 1:
            tradMillions = convertUptoThousand(millions) + " triệu ";
            break;
        default:
            tradMillions = convertUptoThousand(millions) + " triệu ";
        }
        result = result + tradMillions;
        String tradHundredThousands;
        switch (hundredThousands) {
        case 0:
            tradHundredThousands = "";
            break;
        case 1:
            tradHundredThousands = "một nghìn ";
            break;
        default:
            tradHundredThousands = convertUptoThousand(hundredThousands) + " nghìn ";
        }
        result = result + tradHundredThousands;
        String tradThousand;
        tradThousand = convertUptoThousand(thousands);
        result = result + tradThousand;
        // removing extra space if any
        result = result.replaceAll("^\\s+", "").replaceAll("\\b\\s{2,}\\b", " ");
        return StringUtils.capitalize(result);
    }

}
