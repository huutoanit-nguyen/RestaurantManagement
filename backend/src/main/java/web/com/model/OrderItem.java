package web.com.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem extends PanacheEntity {

    @GeneratedValue(strategy = GenerationType.TABLE, generator = "order_items_seq_gen")
    @TableGenerator(name = "order_items_seq_gen", table = "orders_SEQ2", valueColumnName = "next_val", allocationSize = 1)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    public Order order;

    @Column(name = "menu_item_id", nullable = false)
    public Long menuItemId;

    @Column(nullable = false, length = 255)
    public String name; // snapshot

    @Column(nullable = false)
    public long price; // snapshot

    @Column(nullable = false)
    public int quantity;
}