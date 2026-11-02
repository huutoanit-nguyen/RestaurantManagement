package web.com.security;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import web.com.model.Account;
import web.com.model.Membership;

import java.util.Set;

@ApplicationScoped
public class TokenService {

    private static final String ISSUER = "restaurant-app";
    private static final long   EXPIRY = 86400L; // 24h

    /** Token khi chưa có nhà hàng (sau đăng ký hoặc khi chờ onboarding). */
    public String buildBaseToken(Account account) {
        return Jwt.issuer(ISSUER)
                  .subject(account.phone)
                  .groups(Set.of("USER"))
                  .claim("accountId", account.id)
                  .expiresIn(EXPIRY)
                  .sign();
    }

    /** Token khi đã vào nhà hàng. Chủ tự động có group "Quản lý" để @RolesAllowed("Quản lý") luôn pass. */
    public String buildRestaurantToken(Account account, Membership membership) {
        String role = membership.role;
        Set<String> groups;
        if (Roles.CHU_CUA_HANG.equals(role)) {
            groups = Set.of(role, Roles.QUAN_LY);
        } else {
            groups = Set.of(role);
        }

        return Jwt.issuer(ISSUER)
                  .subject(account.phone)
                  .groups(groups)
                  .claim("accountId",    account.id)
                  .claim("restaurantId", membership.restaurantId)
                  .claim("role",         role)
                  .expiresIn(EXPIRY)
                  .sign();
    }
}

