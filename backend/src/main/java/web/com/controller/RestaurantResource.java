package web.com.controller;

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
import java.util.Map;
import java.util.stream.Collectors;

@Path("/api/restaurants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RestaurantResource {

    @Inject TenantContext tenant;
    @Inject TokenService tokenService;

    public record CreateRestaurantRequest(String name) {}
    public record RestaurantResponse(String token, Long restaurantId, String name, String role, String fullName) {}
    public record RestaurantDetail(Long id, String name, String ownerPhone, String createdAt, long staffCount) {}

    // ── POST /api/restaurants — Tạo nhà hàng ────────────────────────────────

    @POST
    @Transactional
    @RolesAllowed({"USER", Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN, Roles.BEP, Roles.CHU_CUA_HANG})
    public Response create(CreateRestaurantRequest req) {
        if (req == null || req.name() == null || req.name().isBlank()) {
            return Response.status(400).entity(new ErrorResponse("Tên nhà hàng không được để trống")).build();
        }

        Long accountId = tenant.accountId();
        Account acc = Account.findById(accountId);
        if (acc == null) return Response.status(401).entity(new ErrorResponse("Tài khoản không hợp lệ")).build();

        // Chỉ cho tạo 1 nhà hàng làm chủ
        if (Restaurant.count("ownerId", accountId) > 0) {
            return Response.status(409).entity(new ErrorResponse("Bạn đã đăng ký nhà hàng rồi")).build();
        }

        Restaurant restaurant = new Restaurant();
        restaurant.name    = req.name().trim();
        restaurant.ownerId = accountId;
        restaurant.persist();

        Membership membership = new Membership();
        membership.accountId    = accountId;
        membership.restaurantId = restaurant.id;
        membership.role         = Roles.CHU_CUA_HANG;
        membership.shift        = "Tất cả";
        membership.status       = Membership.ACTIVE;
        membership.persist();

        String newToken = tokenService.buildRestaurantToken(acc, membership);

        return Response.status(201).entity(
            new RestaurantResponse(newToken, restaurant.id, restaurant.name, Roles.CHU_CUA_HANG, acc.fullName)
        ).build();
    }

    // ── GET /api/restaurants/me ──────────────────────────────────────────────

    @GET
    @Path("/me")
    @RolesAllowed({Roles.CHU_CUA_HANG, Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN, Roles.BEP})
    public Response getMe() {
        Long restaurantId = tenant.restaurantId();
        Restaurant rest = Restaurant.findById(restaurantId);
        if (rest == null) return Response.status(404).entity(new ErrorResponse("Nhà hàng không tồn tại")).build();

        Account owner = Account.findById(rest.ownerId);
        long staffCount = Membership.count("restaurantId = ?1 and status = ?2", restaurantId, Membership.ACTIVE);

        return Response.ok(new RestaurantDetail(
            rest.id, rest.name,
            owner != null ? owner.phone : null,
            rest.createdAt != null ? rest.createdAt.toLocalDate().toString() : null,
            staffCount
        )).build();
    }

    // ── GET /api/restaurants/search?ownerPhone=09xxx ─────────────────────────

    @GET
    @Path("/search")
    @RolesAllowed({"USER", Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN, Roles.BEP, Roles.CHU_CUA_HANG})
    public Response search(@QueryParam("ownerPhone") String ownerPhone) {
        if (ownerPhone == null || ownerPhone.isBlank()) {
            return Response.status(400).entity(new ErrorResponse("Vui lòng nhập số điện thoại chủ quán")).build();
        }
        Account owner = Account.findByPhone(ownerPhone.trim());
        if (owner == null) {
            return Response.status(404).entity(new ErrorResponse("Không tìm thấy chủ quán với số điện thoại này")).build();
        }

        List<Restaurant> restaurants = Restaurant.list("ownerId", owner.id);
        var result = restaurants.stream()
            .map(r -> Map.of("id", (Object) r.id, "name", (Object) r.name))
            .collect(Collectors.toList());
        return Response.ok(result).build();
    }

    // ── POST /api/restaurants/{id}/join-requests ─────────────────────────────

    @POST
    @Path("/{id}/join-requests")
    @Transactional
    @RolesAllowed({"USER", Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN, Roles.BEP, Roles.CHU_CUA_HANG})
    public Response joinRequest(@PathParam("id") Long restaurantId) {
        Long accountId = tenant.accountId();
        Restaurant rest = Restaurant.findById(restaurantId);
        if (rest == null) return Response.status(404).entity(new ErrorResponse("Nhà hàng không tồn tại")).build();

        Membership existing = Membership.find("accountId = ?1 and restaurantId = ?2",
                accountId, restaurantId).firstResult();
        if (existing != null) {
            if (Membership.ACTIVE.equals(existing.status))
                return Response.status(409).entity(new ErrorResponse("Bạn đã là thành viên của nhà hàng này")).build();
            if (Membership.PENDING.equals(existing.status))
                return Response.status(409).entity(new ErrorResponse("Yêu cầu của bạn đang chờ duyệt")).build();
            // REJECTED → cho phép gửi lại
            existing.status = Membership.PENDING;
            existing.role   = null;
            existing.shift  = null;
            return Response.ok(new ErrorResponse("Đã gửi lại yêu cầu tham gia")).build();
        }

        Membership m = new Membership();
        m.accountId    = accountId;
        m.restaurantId = restaurantId;
        m.status       = Membership.PENDING;
        m.persist();

        return Response.status(201).entity(new ErrorResponse("Đã gửi yêu cầu tham gia, chờ chủ quán duyệt")).build();
    }

    // ── GET /api/restaurants/me/join-requests ────────────────────────────────

    public record JoinRequestView(Long membershipId, Long accountId, String fullName, String phone) {}

    @GET
    @Path("/me/join-requests")
    @RolesAllowed({Roles.QUAN_LY, Roles.CHU_CUA_HANG})
    public Response getPendingRequests() {
        Long restaurantId = tenant.restaurantId();
        List<Membership> pending = Membership.list("restaurantId = ?1 and status = ?2",
                restaurantId, Membership.PENDING);
        List<JoinRequestView> result = pending.stream().map(m -> {
            Account a = Account.findById(m.accountId);
            return new JoinRequestView(m.id, m.accountId,
                a != null ? a.fullName : "?", a != null ? a.phone : "?");
        }).collect(Collectors.toList());
        return Response.ok(result).build();
    }

    // ── PUT /api/restaurants/me/join-requests/{id}/approve ───────────────────

    public record ApproveRequest(String role, String shift) {}

    @PUT
    @Path("/me/join-requests/{membershipId}/approve")
    @Transactional
    @RolesAllowed({Roles.QUAN_LY, Roles.CHU_CUA_HANG})
    public Response approve(@PathParam("membershipId") Long membershipId, ApproveRequest req) {
        Long restaurantId   = tenant.restaurantId();
        Long actorAccountId = tenant.accountId();

        Membership actor = Membership.findActive(actorAccountId, restaurantId);
        if (actor == null) return Response.status(403).entity(new ErrorResponse("Không có quyền duyệt")).build();

        Membership target = Membership.find("id = ?1 and restaurantId = ?2 and status = ?3",
                membershipId, restaurantId, Membership.PENDING).firstResult();
        if (target == null) return Response.status(404).entity(new ErrorResponse("Không tìm thấy yêu cầu")).build();

        if (req.role() == null) return Response.status(400).entity(new ErrorResponse("Vui lòng chỉ định vai trò")).build();
        if (!Roles.canAssign(actor.role, req.role())) {
            return Response.status(403).entity(new ErrorResponse("Bạn không có quyền gán vai trò này")).build();
        }

        target.role   = req.role();
        target.shift  = req.shift() != null ? req.shift() : "Ca sáng";
        target.status = Membership.ACTIVE;
        return Response.ok(target).build();
    }

    // ── PUT /api/restaurants/me/join-requests/{id}/reject ────────────────────

    @PUT
    @Path("/me/join-requests/{membershipId}/reject")
    @Transactional
    @RolesAllowed({Roles.QUAN_LY, Roles.CHU_CUA_HANG})
    public Response reject(@PathParam("membershipId") Long membershipId) {
        Long restaurantId = tenant.restaurantId();
        Membership target = Membership.find("id = ?1 and restaurantId = ?2 and status = ?3",
                membershipId, restaurantId, Membership.PENDING).firstResult();
        if (target == null) return Response.status(404).entity(new ErrorResponse("Không tìm thấy yêu cầu")).build();

        target.status = Membership.REJECTED;
        return Response.noContent().build();
    }
}

