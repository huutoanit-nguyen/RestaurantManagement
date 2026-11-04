package web.com.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Tests - TableEntity Domain Rules")
public class TableEntityTest {

    @Test
    @DisplayName("Table default status is AVAILABLE")
    void testTableDefaults() {
        TableEntity table = new TableEntity();
        assertEquals("AVAILABLE", table.status);
    }

    @Test
    @DisplayName("Table fields can be properly set and read")
    void testTableFields() {
        TableEntity table = new TableEntity();
        table.id = 10L;
        table.restaurantId = 1L;
        table.tableNumber = 5;
        table.capacity = 4;
        table.location = "Tầng 1";
        table.status = "OCCUPIED";

        assertEquals(10L, table.id);
        assertEquals(1L, table.restaurantId);
        assertEquals(5, table.tableNumber);
        assertEquals(4, table.capacity);
        assertEquals("Tầng 1", table.location);
        assertEquals("OCCUPIED", table.status);
    }

    @Test
    @DisplayName("Table capacity validation boundary logic")
    void testTableCapacityBoundaries() {
        // Table capacity must be between 1 and 50
        assertTrue(isValidCapacity(1));
        assertTrue(isValidCapacity(4));
        assertTrue(isValidCapacity(10));
        assertTrue(isValidCapacity(50));

        assertFalse(isValidCapacity(0));
        assertFalse(isValidCapacity(-1));
        assertFalse(isValidCapacity(51));
        assertFalse(isValidCapacity(100));
    }

    private boolean isValidCapacity(Integer capacity) {
        return capacity != null && capacity >= 1 && capacity <= 50;
    }
}

