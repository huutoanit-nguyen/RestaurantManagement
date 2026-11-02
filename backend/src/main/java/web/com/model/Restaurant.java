package web.com.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "restaurant")
public class Restaurant extends PanacheEntity {

    @NotBlank(message = "Tên nhà hàng không được để trống")
    @Column(nullable = false, length = 255)
    public String name;

    @Column(name = "owner_id", nullable = false)
    public Long ownerId;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();
}

