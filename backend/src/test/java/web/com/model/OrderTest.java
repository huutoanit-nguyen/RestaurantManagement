package web.com.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Tests - Order & OrderItem Logic")
public class OrderTest {

    @Test
    @DisplayName("Default order status is PENDING and total is 0")
    void testOrderDefaults() {
        Order order = new Order();
        assertEquals("PENDING", order.status);
        assertEquals(0L, order.total);
        assertNotNull(order.createdAt);
        assertNull(order.paidAt);
        assertNotNull(order.items);
        assertTrue(order.items.isEmpty());
    }

    @Test
    @DisplayName("recalculateTotal accurately sums price * quantity across all items")
    void testRecalculateTotal() {
        Order order = new Order();

        OrderItem item1 = new OrderItem();
        item1.order = order;
        item1.menuItemId = 1L;
        item1.name = "Phở bò";
        item1.price = 55_000L;
        item1.quantity = 2; // 110,000

        OrderItem item2 = new OrderItem();
        item2.order = order;
        item2.menuItemId = 2L;
        item2.name = "Trà đá";
        item2.price = 5_000L;
        item2.quantity = 3; // 15,000

        OrderItem item3 = new OrderItem();
        item3.order = order;
        item3.menuItemId = 3L;
        item3.name = "Bánh mì";
        item3.price = 25_000L;
        item3.quantity = 1; // 25,000

        order.items.add(item1);
        order.items.add(item2);
        order.items.add(item3);

        order.recalculateTotal();

        assertEquals(150_000L, order.total);
    }

    @Test
    @DisplayName("recalculateTotal with empty items list returns 0")
    void testRecalculateTotalEmpty() {
        Order order = new Order();
        order.total = 99_999L; // preset dirty value
        order.recalculateTotal();
        assertEquals(0L, order.total);
    }

    @Test
    @DisplayName("Simulating payment lifecycle: status transitions to PAID and records paidAt")
    void testPaymentLifecycle() {
        Order order = new Order();
        order.tableId = 5L;
        order.restaurantId = 1L;

        OrderItem item = new OrderItem();
        item.order = order;
        item.price = 80_000L;
        item.quantity = 1;
        order.items.add(item);
        order.recalculateTotal();

        assertEquals("PENDING", order.status);
        assertEquals(80_000L, order.total);

        // Simulate payment
        order.status = "PAID";
        order.paidAt = LocalDateTime.now();

        assertEquals("PAID", order.status);
        assertNotNull(order.paidAt);
    }
}

