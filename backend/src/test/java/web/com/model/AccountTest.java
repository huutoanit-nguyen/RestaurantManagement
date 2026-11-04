package web.com.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Tests - Account Model & Security")
public class AccountTest {

    @Test
    @DisplayName("Password hashing produces valid Bcrypt hash and matches raw password")
    void testPasswordHashingAndVerification() {
        Account account = new Account();
        account.phone = "0901234567";
        account.fullName = "Nguyen Van A";

        String rawPassword = "StrongPassword@123";
        account.hashPassword(rawPassword);

        assertNotNull(account.password);
        assertNotEquals(rawPassword, account.password);
        assertTrue(account.password.startsWith("$2a$") || account.password.startsWith("$2b$") || account.password.startsWith("$2y$"));

        // checkPassword should succeed with exact password
        assertTrue(account.checkPassword(rawPassword));

        // checkPassword should fail with wrong password
        assertFalse(account.checkPassword("WrongPassword@123"));
        assertFalse(account.checkPassword("strongpassword@123"));
        assertFalse(account.checkPassword(""));
    }

    @Test
    @DisplayName("Multiple hashes of the same password produce different salts")
    void testBcryptSalting() {
        Account account1 = new Account();
        account1.hashPassword("SamePassword123");

        Account account2 = new Account();
        account2.hashPassword("SamePassword123");

        assertNotEquals(account1.password, account2.password, "Each bcrypt hash must have a unique random salt");
        assertTrue(account1.checkPassword("SamePassword123"));
        assertTrue(account2.checkPassword("SamePassword123"));
    }
}

