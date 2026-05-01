package web.com.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "restaurant_table")
public class TableEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "table_number", nullable = false, unique = true)
    public Integer tableNumber;

    @Column(name = "capacity", nullable = false)
    public Integer capacity;

    @Column(name = "location")
    public String location; // e.g., "Indoor", "Outdoor", "VIP"

    @Column(name = "status", nullable = false)
    public String status; // "AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"

    // ==================== Custom Queries ====================

    public static List<TableEntity> findByStatus(String status) {
        return list("status", status);
    }

    public static TableEntity findByTableNumber(Integer tableNumber) {
        return find("tableNumber", tableNumber).firstResult();
    }
}
