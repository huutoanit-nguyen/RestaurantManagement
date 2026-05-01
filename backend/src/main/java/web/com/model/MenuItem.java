package web.com.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
public class MenuItem extends PanacheEntity {
    @NotBlank(message = "Tên món không được để trống")
    public String name;

    @NotBlank(message = "Danh mục không được để trống")
    public String category;

    @Min(value = 1000, message = "Giá phải lớn hơn 1.000đ")
    public long price;
}
