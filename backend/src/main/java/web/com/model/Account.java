package web.com.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "account",
       uniqueConstraints = @UniqueConstraint(columnNames = "phone"))
public class Account extends PanacheEntity {

    @NotBlank(message = "Họ tên không được để trống")
    @Column(name = "full_name", nullable = false, length = 255)
    public String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0")
    @Column(nullable = false, unique = true, length = 15)
    public String phone;

    @JsonIgnore
    @Column(nullable = false, length = 255)
    public String password;

    public static Account findByPhone(String phone) {
        return find("phone", phone).firstResult();
    }

    public void hashPassword(String raw) {
        this.password = BcryptUtil.bcryptHash(raw, 12);
    }

    public boolean checkPassword(String raw) {
        return BcryptUtil.matches(raw, this.password);
    }
}

