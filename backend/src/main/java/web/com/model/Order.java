package web.com.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order extends PanacheEntity {

    @GeneratedValue(strategy = GenerationType.TABLE, generator = "orders_seq_gen")
    @TableGenerator(name = "orders_seq_gen", table = "orders_SEQ", valueColumnName = "next_val", allocationSize = 1)
    public Long id;

    @Column(name = "restaurantTable_id", nullable = false)
    public Long tableId;

    @Column(nullable = false, length = 20)
    public String status = "PENDING"; // PENDING | PAID

    @Column(name="totalPrice",nullable = false)
    public long total = 0;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "paid_at")
    public LocalDateTime paidAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    public List<OrderItem> items = new ArrayList<>();

    // Helper — tính lại total từ items
    public void recalculateTotal() {
        this.total = items.stream()
            .mapToLong(i -> i.price * i.quantity)
            .sum();
    }
}