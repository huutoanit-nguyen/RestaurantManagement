package web.com.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "staff")
public class Staff extends PanacheEntity {

    @NotBlank(message = "Tên không được để trống")
    @Column(name = "fullName", nullable = false, length = 255)
    public String fullName;

    @NotBlank(message = "Vai trò không được để trống")
    @Column(nullable = false, length = 100)
    public String role;

    @NotBlank(message = "Ca làm việc không được để trống")
    @Column(nullable = false, length = 50)
    public String shift;

    @Size(min = 3, max = 20, message = "Tên đăng nhập phải từ 3-20 kí tự")
    @Column(name = "username", length = 50)
    public String username;

    @JsonIgnore 
    @Column(name = "password", length = 255)
    public String password;

    // ✅ Gọi thủ công trong Resource, không tự động
    public void hashPassword(String rawPassword) {
        this.password = BcryptUtil.bcryptHash(rawPassword, 12);
    }
}