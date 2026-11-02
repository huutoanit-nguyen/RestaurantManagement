package web.com.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "menuitem")
public class MenuItem extends PanacheEntity {

    @Column(name = "restaurant_id", nullable = false)
    public Long restaurantId;

    @NotBlank(message = "Tên món không được để trống")
    public String name;

    @NotBlank(message = "Danh mục không được để trống")
    public String category;

    @Min(value = 1000, message = "Giá phải lớn hơn 1.000đ")
    public long price;
}
