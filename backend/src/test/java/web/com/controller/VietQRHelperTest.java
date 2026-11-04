package web.com.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Tests - VietQR URL Generation")
public class VietQRHelperTest {

    public static String buildVietQRUrl(String bankId, String accountNo, long amount, String description) {
        String encoded = URLEncoder.encode(description, StandardCharsets.UTF_8);
        return String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=ResMana",
                bankId, accountNo, amount, encoded);
    }

    @Test
    @DisplayName("VietQR URL is formatted correctly with proper parameters")
    void testVietQRUrlFormat() {
        String url = buildVietQRUrl("MB", "0123456789", 150_000L, "Table 05 - ResMana");

        assertTrue(url.startsWith("https://img.vietqr.io/image/MB-0123456789-compact2.png"));
        assertTrue(url.contains("amount=150000"));
        assertTrue(url.contains("addInfo=Table+05+-+ResMana") || url.contains("addInfo=Table%2005%20-%20ResMana"));
        assertTrue(url.contains("accountName=ResMana"));
    }

    @Test
    @DisplayName("VietQR URL encodes special characters and Vietnamese text safely")
    void testVietQREncoding() {
        String url = buildVietQRUrl("VCB", "9876543210", 250_000L, "Bàn 12 - Trà & Cà phê");

        assertFalse(url.contains(" "), "URL must not contain raw spaces");
        assertFalse(url.contains("& Cà"), "URL must not contain raw unencoded ampersands or accents");
        assertTrue(url.contains("amount=250000"));
    }

    @Test
    @DisplayName("VietQR URL handles large amounts accurately")
    void testVietQRLargeAmount() {
        long largeAmount = 25_500_000L;
        String url = buildVietQRUrl("TCB", "19001234", largeAmount, "Party Table 01");

        assertTrue(url.contains("amount=25500000"));
    }
}

