package web.com.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "membership",
       uniqueConstraints = @UniqueConstraint(columnNames = {"account_id", "restaurant_id"}))
public class Membership extends PanacheEntity {

    public static final String ACTIVE   = "ACTIVE";
    public static final String PENDING  = "PENDING";
    public static final String REJECTED = "REJECTED";

    @Column(name = "account_id", nullable = false)
    public Long accountId;

    @Column(name = "restaurant_id", nullable = false)
    public Long restaurantId;

    @Column(length = 50)
    public String role;

    @Column(length = 50)
    public String shift;

    @Column(nullable = false, length = 20)
    public String status = ACTIVE;

    public static Membership findActive(Long accountId, Long restaurantId) {
        return find("accountId = ?1 and restaurantId = ?2 and status = ?3",
                accountId, restaurantId, ACTIVE).firstResult();
    }

    public static List<Membership> listActiveByRestaurant(Long restaurantId) {
        return list("restaurantId = ?1 and status = ?2", restaurantId, ACTIVE);
    }
}

