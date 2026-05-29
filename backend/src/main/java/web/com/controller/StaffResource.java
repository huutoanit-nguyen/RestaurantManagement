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

    // GET /api/staff
    // GET /api/staff?role=Bếp
    // GET /api/staff?shift=Ca sáng
    // GET /api/staff?search=Nguyễn
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
        return Response.noContent().build(); // 204
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

    // PUT /api/staff/{id}/account
    @PUT
    @Path("/{id}/account")
    @Transactional
    @RolesAllowed("Quản lý")
    public Staff setAccount(@PathParam("id") Long id, AccountRequest req) {
        Staff entity = Staff.findById(id);
        if (entity == null)
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        entity.username = req.username();
        entity.setPassword(req.password);
        entity.persistAndFlush();
        return entity;
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

    // PUT /api/staff/me/password — đổi mật khẩu bản thân
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

        if (!BcryptUtil.matches(req.oldPassword(), staff.password)) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Mật khẩu cũ không đúng"))
                    .build();
        }
        if (req.newPassword().length() < 6) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Mật khẩu mới tối thiểu 6 ký tự"))
                    .build();
        }

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