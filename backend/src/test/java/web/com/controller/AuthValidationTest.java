package web.com.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Tests - Auth Validation Rules")
public class AuthValidationTest {

    private static final String PHONE_REGEX = "^0\\d{9}$";
    private static final String PASSWORD_REGEX = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$";

    @ParameterizedTest
    @ValueSource(strings = {
        "0901234567",
        "0329876543",
        "0868888999",
        "0771234567",
        "0589991122"
    })
    @DisplayName("Valid Vietnamese phone numbers starting with 0 and having 10 digits")
    void testValidPhoneNumbers(String phone) {
        assertTrue(phone.matches(PHONE_REGEX), "Phone should be valid: " + phone);
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "",               // empty
        "090123456",      // 9 digits (too short)
        "09012345678",    // 11 digits (too long)
        "1901234567",     // doesn't start with 0
        "84901234567",    // starts with 84 instead of 0
        "090123456a",     // contains non-digit
        "090 123 456",    // contains spaces
        "+84901234567"    // with plus prefix
    })
    @DisplayName("Invalid phone numbers rejected")
    void testInvalidPhoneNumbers(String phone) {
        assertFalse(phone.matches(PHONE_REGEX), "Phone should be invalid: " + phone);
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "Password123",
        "Aa123456",
        "ResMana2026!",
        "SecureP@ss1",
        "Abcdefg1"
    })
    @DisplayName("Valid passwords with min 8 chars, lowercase, uppercase, and digit")
    void testValidPasswords(String password) {
        assertTrue(password.matches(PASSWORD_REGEX), "Password should be valid: " + password);
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "",               // empty
        "Pass1",          // less than 8 chars
        "password123",    // missing uppercase
        "PASSWORD123",    // missing lowercase
        "PasswordOnly",   // missing digit
        "12345678"        // only digits
    })
    @DisplayName("Weak passwords rejected by policy")
    void testInvalidPasswords(String password) {
        assertFalse(password.matches(PASSWORD_REGEX), "Password should be invalid: " + password);
    }
}

