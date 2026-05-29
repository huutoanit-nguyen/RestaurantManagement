package web.com.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_change_log")
public class PasswordChangeLog extends PanacheEntity {

    @Column(name = "staff_id", nullable = false)
    public Long staffId;

    @Column(name = "staff_name", nullable = false, length = 255)
    public String staffName;

    @Column(name = "changed_at", nullable = false)
    public LocalDateTime changedAt;
}