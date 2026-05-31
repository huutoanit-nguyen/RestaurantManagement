package web.com.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import web.com.exception.ErrorResponse;
import web.com.model.PasswordChangeLog;
import web.com.model.Staff;

import java.time.LocalDateTime;
import java.util.List;

import io.quarkus.elytron.security.common.BcryptUtil;

@Path("/api/staff")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class StaffResource {

    // Regex check độ khó: Ít nhất 8 ký tự, có 1 chữ hoa, 1 chữ thường, 1 chữ số
    private static final String PASSWORD_REGEX = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$";
    private static final String PASSWORD_ERROR_MSG = "Mật khẩu không đủ an toàn! (Phải từ 8 ký tự trở lên, bao gồm chữ hoa, chữ thường và số).";

    // GET /api/staff
    @GET
    @PermitAll
    public List<Staff> getAll(
            @QueryParam("role") String role,
            @QueryParam("shift") String shift,
            @QueryParam("search") String search) {
        if (role != null)
            return Staff.list("role", role);
        if (shift != null)
            return Staff.list("shift", shift);
        if (search != null)
            return Staff.find("lower(name) like ?1",
                    "%" + search.toLowerCase() + "%").list();
        return Staff.listAll();
    }

    // GET /api/staff/{id}
    @GET
    @Path("/{id}")
    public Staff getById(@PathParam("id") Long id) {
        return findOrThrow(id);
    }

    // POST /api/staff
    @POST
    @Transactional
    @RolesAllowed("Quản lý")
    public Response create(@Valid Staff staff) {
        staff.id = null;
        staff.persist();
        return Response.status(Response.Status.CREATED).entity(staff).build();
    }

    // PUT /api/staff/{id}
    @PUT
    @Path("/{id}")
    @Transactional
    public Staff update(@PathParam("id") Long id, @Valid Staff body) {
        Staff entity = findOrThrow(id);
        entity.fullName = body.fullName;
        entity.role = body.role;
        entity.shift = body.shift;
        return entity;
    }

    // DELETE /api/staff/{id}
    @DELETE
    @Path("/{id}")
    @Transactional
    @RolesAllowed("Quản lý")
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = Staff.deleteById(id);
        if (!deleted)
            throw notFound(id);
        return Response.noContent().build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private Staff findOrThrow(Long id) {
        Staff s = Staff.findById(id);
        if (s == null)
            throw notFound(id);
        return s;
    }

    private WebApplicationException notFound(Long id) {
        return new WebApplicationException(
                Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorResponse("Không tìm thấy nhân viên với id = " + id))
                        .build());
    }

    // PUT /api/staff/{id}/account — Quản lý cấp/đổi tài khoản cho nhân viên
    @PUT
    @Path("/{id}/account")
    @Transactional
    @RolesAllowed("Quản lý")
    public Response setAccount(@PathParam("id") Long id, AccountRequest req) {
        Staff entity = Staff.findById(id);
        if (entity == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("Không tìm thấy nhân viên"))
                    .build();
        }

        // THÊM: Kiểm tra độ khó mật khẩu khi Admin tạo/cập nhật cho nhân viên
        if (req.password() == null || !req.password().matches(PASSWORD_REGEX)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(PASSWORD_ERROR_MSG))
                    .build();
        }

        entity.username = req.username();
        entity.setPassword(req.password()); // Hàm setPassword này trong model của Toản tự Bcrypt rồi đúng không?
        entity.persistAndFlush();
        return Response.ok(entity).build();
    }

    // DELETE /api/staff/{id}/account — xoá tài khoản
    @DELETE
    @Path("/{id}/account")
    @Transactional
    @RolesAllowed("Quản lý")
    public Response removeAccount(@PathParam("id") Long id) {
        Staff entity = findOrThrow(id);
        entity.username = null;
        entity.password = null;
        return Response.noContent().build();
    }

    public record AccountRequest(String username, String password) {
    }

    // GET /api/staff/me — lấy thông tin bản thân
    @GET
    @Path("/me")
    @RolesAllowed({ "Quản lý", "Phục vụ", "Thu ngân", "Bếp", "Bảo vệ" })
    public Staff getMe(@Context SecurityContext ctx) {
        String username = ctx.getUserPrincipal().getName();
        Staff staff = Staff.find("username", username).firstResult();
        if (staff == null)
            throw notFound(-1L);
        return staff;
    }

    // PUT /api/staff/me/password — Bản thân tự đổi mật khẩu
    @PUT
    @Path("/me/password")
    @Transactional
    @RolesAllowed({ "Quản lý", "Phục vụ", "Thu ngân", "Bếp", "Bảo vệ" })
    public Response changeMyPassword(
            @Context SecurityContext ctx,
            ChangePasswordRequest req) {
        String username = ctx.getUserPrincipal().getName();
        Staff staff = Staff.find("username", username).firstResult();
        if (staff == null)
            throw notFound(-1L);

        // 1. Kiểm tra mật khẩu cũ
        if (!BcryptUtil.matches(req.oldPassword(), staff.password)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Mật khẩu cũ không đúng"))
                    .build();
        }

        // 2. THÊM: Kiểm tra mật khẩu mới theo chuẩn độ khó (Chữ hoa, chữ thường, số, >= 8 ký tự)
        if (req.newPassword() == null || !req.newPassword().matches(PASSWORD_REGEX)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse(PASSWORD_ERROR_MSG))
                    .build();
        }

        // Mã hóa mật khẩu mới và lưu
        staff.password = BcryptUtil.bcryptHash(req.newPassword(), 12);
        staff.persistAndFlush();

        // Ghi log để admin xem
        PasswordChangeLog log = new PasswordChangeLog();
        log.staffId = staff.id;
        log.staffName = staff.fullName;
        log.changedAt = LocalDateTime.now();
        log.persist();

        return Response.ok().build();
    }

    public record ChangePasswordRequest(String oldPassword, String newPassword) {
    }

    @GET
    @Path("/password-logs")
    @RolesAllowed("Quản lý")
    public List<PasswordChangeLog> getPasswordLogs() {
        return PasswordChangeLog.find("ORDER BY changedAt DESC").list();
    }
}