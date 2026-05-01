package web.com.controller;

import io.smallrye.jwt.build.Jwt;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import io.quarkus.elytron.security.common.BcryptUtil;
import web.com.exception.ErrorResponse;
import web.com.model.Staff;

import java.util.Set;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    public record LoginRequest(String username, String password) {}
    public record LoginResponse(String token, String name, String role) {}

    @POST
    @Path("/login")
    public Response login(LoginRequest req) {
        Staff staff = Staff.find("username", req.username()).firstResult();

        if (staff == null || !BcryptUtil.matches(req.password(), staff.password)) {
            return Response.status(Response.Status.UNAUTHORIZED)
                           .entity(new ErrorResponse("Sai tài khoản hoặc mật khẩu"))
                           .build();
        }

        String token = Jwt.issuer("restaurant-app")
                          .subject(staff.username)
                          .groups(Set.of(staff.role))
                          .expiresIn(86400) // 24h
                          .sign();

        return Response.ok(new LoginResponse(token, staff.fullName, staff.role)).build();
    }
}