package web.com.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "staff")
public class Staff extends PanacheEntity {

    // Sửa lại cho khớp hoàn toàn với SQL
    @NotBlank(message = "Tên không được để trống")
    @Column(name = "fullName", nullable = false, length = 255)
    public String fullName; // Đổi từ name thành fullName cho đồng bộ

    @NotBlank(message = "Vai trò không được để trống")
    @Column(nullable = false, length = 100)
    public String role;

    @NotBlank(message = "Ca làm việc không được để trống")
    @Column(nullable = false, length = 50)
    public String shift;

    @Column(unique = true, length = 50) // Khớp với SQL VARCHAR(50)
    public String username;

    @Column(length = 255)
    @JsonIgnore  
    public String password;

    // Hàm này dùng khi tạo mới nhân viên từ API
    public void setPassword(String rawPassword) {
        this.password = BcryptUtil.bcryptHash(rawPassword);
    }
}