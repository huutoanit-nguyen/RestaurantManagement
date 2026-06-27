package web.com.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Entity
@Table(name = "restaurant_table")
public class TableEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "table_number", nullable = false, unique = true)
    @NotNull(message = "Số bàn không được để trống")
    @Min(value = 1, message = "Số bàn phải là số nguyên dương lớn hơn hoặc bằng 1")
    public Integer tableNumber;


    @Column(name = "capacity", nullable = false)
    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa phải là số nguyên dương từ 1 đến 50")
    @Max(value = 50, message = "Sức chứa tối đa của một bàn là 50 người")
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
