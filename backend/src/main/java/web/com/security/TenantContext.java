package web.com.security;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import web.com.exception.ErrorResponse;

/**
 * Helper lấy accountId và restaurantId từ JWT token hiện tại.
 */
@RequestScoped
public class TenantContext {

    @Inject
    JsonWebToken jwt;

    public Long accountId() {
        return parseLong(jwt.getClaim("accountId"), "Thiếu claim accountId trong token");
    }

    public Long restaurantId() {
        return parseLong(jwt.getClaim("restaurantId"), "Chưa chọn nhà hàng hoặc token không hợp lệ");
    }

    private Long parseLong(Object raw, String errorMsg) {
        if (raw == null) throw unauthorized(errorMsg);
        if (raw instanceof jakarta.json.JsonNumber jn) {
            return jn.longValue();
        }
        if (raw instanceof Number n) {
            return n.longValue();
        }
        try {
            return Long.parseLong(raw.toString());
        } catch (Exception e) {
            throw unauthorized(errorMsg);
        }
    }

    private WebApplicationException unauthorized(String msg) {
        return new WebApplicationException(
            Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorResponse(msg))
                    .build()
        );
    }
}

