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
import web.com.model.PasswordChangeLog;
import web.com.security.Roles;
import web.com.security.TenantContext;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Path("/api/staff")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class StaffResource {

    private static final String PASSWORD_REGEX = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$";
    private static final String PASSWORD_ERROR_MSG = "Mật khẩu phải từ 8 ký tự trở lên, bao gồm chữ hoa, chữ thường và số";

    @Inject TenantContext tenant;

    // ── DTOs ─────────────────────────────────────────────────────────────────

    public record StaffView(Long membershipId, Long accountId, String fullName,
                            String phone, String role, String shift) {}

    public record UpdateStaffRequest(String role, String shift) {}

    public record ChangePasswordRequest(String oldPassword, String newPassword) {}

    // ── GET /api/staff — Danh sách nhân viên (membership ACTIVE) của nhà hàng ──

    @GET
    @RolesAllowed(Roles.QUAN_LY)
    public List<StaffView> getAll() {
        Long rid = tenant.restaurantId();
        List<Membership> members = Membership.listActiveByRestaurant(rid);
        return members.stream().map(this::toView).collect(Collectors.toList());
    }

    // ── PUT /api/staff/{membershipId} — Đổi role/ca ──────────────────────────

    @PUT
    @Path("/{membershipId}")
    @Transactional
    @RolesAllowed(Roles.QUAN_LY)
    public Response update(@PathParam("membershipId") Long mid, UpdateStaffRequest req) {
        Long rid = tenant.restaurantId();
        Membership actor = currentMember();
        if (actor == null) return forbidden("Không xác định được quyền của bạn trong nhà hàng này");

        Membership target = Membership.find("id = ?1 and restaurantId = ?2 and status = ?3",
                mid, rid, Membership.ACTIVE).firstResult();
        if (target == null) return notFound();

        // Quản lý không được sửa Quản lý khác hay Chủ; không ai sửa được Chủ
        if (!Roles.canManage(actor.role, target.role)) {
            return forbidden("Bạn không có quyền sửa người này");
        }

        // Quản lý không được bổ nhiệm Quản lý; chỉ Chủ mới được
        if (req.role() != null && !Roles.canAssign(actor.role, req.role())) {
            return forbidden("Bạn không có quyền gán vai trò này");
        }

        if (req.role() != null)  target.role = req.role();
        if (req.shift() != null) target.shift = req.shift();

        return Response.ok(toView(target)).build();
    }

    // ── DELETE /api/staff/{membershipId} — Cho nghỉ (xóa membership) ─────────

    @DELETE
    @Path("/{membershipId}")
    @Transactional
    @RolesAllowed(Roles.QUAN_LY)
    public Response delete(@PathParam("membershipId") Long mid) {
        Long rid = tenant.restaurantId();
        Membership actor = currentMember();
        if (actor == null) return forbidden("Không xác định được quyền của bạn trong nhà hàng này");

        Membership target = Membership.find("id = ?1 and restaurantId = ?2 and status = ?3",
                mid, rid, Membership.ACTIVE).firstResult();
        if (target == null) return notFound();

        if (!Roles.canManage(actor.role, target.role)) {
            return forbidden("Bạn không có quyền cho người này nghỉ");
        }

        target.delete();
        return Response.noContent().build();
    }

    // ── GET /api/staff/me — Thông tin bản thân ───────────────────────────────

    @GET
    @Path("/me")
    @RolesAllowed({ Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN, Roles.BEP })
    public Response getMe() {
        Long accountId = tenant.accountId();
        Account acc = Account.findById(accountId);
        if (acc == null) return Response.status(404).entity(new ErrorResponse("Không tìm thấy tài khoản")).build();

        Membership m = currentMember();
        if (m == null) return Response.status(404).entity(new ErrorResponse("Không tìm thấy thông tin làm việc")).build();

        return Response.ok(toView(m)).build();
    }

    // ── PUT /api/staff/me/password — Tự đổi mật khẩu ─────────────────────────

    @PUT
    @Path("/me/password")
    @Transactional
    @RolesAllowed({ Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN, Roles.BEP })
    public Response changePassword(ChangePasswordRequest req) {
        if (req == null || req.oldPassword() == null || req.newPassword() == null) {
            return Response.status(400).entity(new ErrorResponse("Thiếu thông tin mật khẩu")).build();
        }

        Long accountId = tenant.accountId();
        Account acc = Account.findById(accountId);
        if (acc == null) return Response.status(404).entity(new ErrorResponse("Không tìm thấy tài khoản")).build();

        if (!acc.checkPassword(req.oldPassword())) {
            return Response.status(400).entity(new ErrorResponse("Mật khẩu cũ không đúng")).build();
        }

        if (!req.newPassword().matches(PASSWORD_REGEX)) {
            return Response.status(400).entity(new ErrorResponse(PASSWORD_ERROR_MSG)).build();
        }

        acc.hashPassword(req.newPassword());

        PasswordChangeLog log = new PasswordChangeLog();
        log.restaurantId = tenant.restaurantId();
        log.staffId      = acc.id;
        log.staffName    = acc.fullName;
        log.changedAt    = LocalDateTime.now();
        log.persist();

        return Response.ok().build();
    }

    // ── GET /api/staff/password-logs — Log đổi mật khẩu của nhà hàng ──────────

    @GET
    @Path("/password-logs")
    @RolesAllowed(Roles.QUAN_LY)
    public List<PasswordChangeLog> getPasswordLogs() {
        return PasswordChangeLog.find("restaurantId = ?1 order by changedAt desc",
                tenant.restaurantId()).list();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Membership currentMember() {
        return Membership.findActive(tenant.accountId(), tenant.restaurantId());
    }

    private StaffView toView(Membership m) {
        Account acc = Account.findById(m.accountId);
        return new StaffView(
            m.id,
            m.accountId,
            acc != null ? acc.fullName : "?",
            acc != null ? acc.phone : "?",
            m.role,
            m.shift
        );
    }

    private Response notFound() {
        return Response.status(404).entity(new ErrorResponse("Không tìm thấy nhân viên")).build();
    }

    private Response forbidden(String msg) {
        return Response.status(403).entity(new ErrorResponse(msg)).build();
    }
}
