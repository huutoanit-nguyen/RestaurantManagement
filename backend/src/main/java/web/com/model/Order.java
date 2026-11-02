package web.com.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order extends PanacheEntity {

    @Column(name = "restaurant_id", nullable = false)
    public Long restaurantId;

    @Column(name = "restaurantTable_id", nullable = false)
    public Long tableId;

    @Column(nullable = false, length = 20)
    public String status = "PENDING";

    @Column(name = "totalPrice", nullable = false)
    public long total = 0;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "paid_at")
    public LocalDateTime paidAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    public List<OrderItem> items = new ArrayList<>();

    public void recalculateTotal() {
        this.total = items.stream()
            .mapToLong(i -> i.price * i.quantity)
            .sum();
    }
}
