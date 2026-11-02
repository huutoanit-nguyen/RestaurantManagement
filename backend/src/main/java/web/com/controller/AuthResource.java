package web.com.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import web.com.exception.ErrorResponse;
import web.com.model.Account;
import web.com.model.Membership;
import web.com.model.Restaurant;
import web.com.security.Roles;
import web.com.security.TenantContext;
import web.com.security.TokenService;

import java.util.List;
import java.util.stream.Collectors;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject TokenService tokenService;
    @Inject TenantContext tenant;

    // ── DTOs ─────────────────────────────────────────────────────────────────

    public record RegisterRequest(String phone, String password, String fullName) {}
    public record LoginRequest(String phone, String password) {}
    public record SelectRestaurantRequest(Long restaurantId) {}
    public record RestaurantItem(Long id, String name, String role) {}
    public record AuthResponse(String token, String fullName, Long restaurantId,
                               String role, List<RestaurantItem> restaurants) {}

    // ── POST /api/auth/register ──────────────────────────────────────────────

    @POST
    @Path("/register")
    @PermitAll
    @Transactional
    public Response register(RegisterRequest req) {
        if (req == null || req.phone() == null || req.password() == null || req.fullName() == null) {
            return Response.status(400).entity(new ErrorResponse("Thiếu thông tin đăng ký")).build();
        }
        if (!req.phone().matches("^0\\d{9}$")) {
            return Response.status(400).entity(new ErrorResponse("Số điện thoại phải gồm 10 chữ số bắt đầu bằng 0")).build();
        }
        if (!req.password().matches("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$")) {
            return Response.status(400).entity(new ErrorResponse("Mật khẩu phải từ 8 ký tự, có chữ hoa, chữ thường và số")).build();
        }
        if (req.fullName().isBlank()) {
            return Response.status(400).entity(new ErrorResponse("Họ tên không được để trống")).build();
        }

        if (Account.findByPhone(req.phone()) != null) {
            return Response.status(409).entity(new ErrorResponse("Số điện thoại đã được đăng ký")).build();
        }

        Account acc = new Account();
        acc.phone    = req.phone();
        acc.fullName = req.fullName().trim();
        acc.hashPassword(req.password());
        acc.persist();

        String token = tokenService.buildBaseToken(acc);

        return Response.status(201).entity(
            new AuthResponse(token, acc.fullName, null, null, List.of())
        ).build();
    }

    // ── POST /api/auth/login ─────────────────────────────────────────────────

    @POST
    @Path("/login")
    @PermitAll
    public Response login(LoginRequest req) {
        if (req == null || req.phone() == null || req.password() == null) {
            return Response.status(400).entity(new ErrorResponse("Thiếu số điện thoại hoặc mật khẩu")).build();
        }

        Account acc = Account.findByPhone(req.phone());
        if (acc == null || !acc.checkPassword(req.password())) {
            return Response.status(401).entity(new ErrorResponse("Sai số điện thoại hoặc mật khẩu")).build();
        }

        // Lấy danh sách membership ACTIVE của tài khoản
        List<Membership> memberships = Membership.list("accountId = ?1 and status = ?2",
                acc.id, Membership.ACTIVE);

        List<RestaurantItem> restaurantList = memberships.stream().map(m -> {
            Restaurant r = Restaurant.findById(m.restaurantId);
            return new RestaurantItem(m.restaurantId, r != null ? r.name : "Nhà hàng", m.role);
        }).collect(Collectors.toList());

        // Chỉ có 1 nhà hàng → trả token đã nhúng restaurantId
        if (memberships.size() == 1) {
            Membership m = memberships.get(0);
            String token = tokenService.buildRestaurantToken(acc, m);
            return Response.ok(new AuthResponse(
                token, acc.fullName, m.restaurantId, m.role, restaurantList
            )).build();
        }

        // Nhiều nhà hàng hoặc chưa có → trả base token, frontend sẽ chuyển hướng
        String token = tokenService.buildBaseToken(acc);
        return Response.ok(new AuthResponse(
            token, acc.fullName, null, null, restaurantList
        )).build();
    }

    // ── POST /api/auth/select-restaurant ─────────────────────────────────────

    @POST
    @Path("/select-restaurant")
    @RolesAllowed({"USER", Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN, Roles.BEP, Roles.CHU_CUA_HANG})
    public Response selectRestaurant(SelectRestaurantRequest req) {
        Long accountId = tenant.accountId();
        Account acc = Account.findById(accountId);
        if (acc == null) return Response.status(401).entity(new ErrorResponse("Tài khoản không tồn tại")).build();

        Membership m = Membership.findActive(accountId, req.restaurantId());
        if (m == null) {
            return Response.status(403).entity(new ErrorResponse("Bạn không phải thành viên của nhà hàng này")).build();
        }

        String newToken = tokenService.buildRestaurantToken(acc, m);

        List<Membership> all = Membership.list("accountId = ?1 and status = ?2", accountId, Membership.ACTIVE);
        List<RestaurantItem> restaurantList = all.stream().map(ms -> {
            Restaurant r = Restaurant.findById(ms.restaurantId);
            return new RestaurantItem(ms.restaurantId, r != null ? r.name : "Nhà hàng", ms.role);
        }).collect(Collectors.toList());

        return Response.ok(new AuthResponse(
            newToken, acc.fullName, m.restaurantId, m.role, restaurantList
        )).build();
    }
}
