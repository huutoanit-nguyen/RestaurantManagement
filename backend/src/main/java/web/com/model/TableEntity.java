package web.com.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Entity
@Table(name = "restaurant_table",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "table_number"}))
public class TableEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "restaurant_id", nullable = false)
    public Long restaurantId;

    @Column(name = "table_number", nullable = false)
    @NotNull(message = "Số bàn không được để trống")
    @Min(value = 1, message = "Số bàn phải là số nguyên dương lớn hơn hoặc bằng 1")
    public Integer tableNumber;

    @Column(name = "capacity", nullable = false)
    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa phải là số nguyên dương từ 1 đến 50")
    @Max(value = 50, message = "Sức chứa tối đa của một bàn là 50 người")
    public Integer capacity;

    @Column(name = "location")
    public String location;

    @Column(name = "status", nullable = false)
    public String status = "AVAILABLE";

    // ── Custom Queries ──────────────────────────────────────────────────

    public static List<TableEntity> listByRestaurant(Long restaurantId) {
        return list("restaurantId", restaurantId);
    }

    public static List<TableEntity> findByStatus(Long restaurantId, String status) {
        return list("restaurantId = ?1 and status = ?2", restaurantId, status);
    }

    public static TableEntity findByIdAndRestaurant(Long id, Long restaurantId) {
        return find("id = ?1 and restaurantId = ?2", id, restaurantId).firstResult();
    }

    public static TableEntity findByTableNumber(Long restaurantId, Integer tableNumber) {
        return find("restaurantId = ?1 and tableNumber = ?2", restaurantId, tableNumber).firstResult();
    }
}
