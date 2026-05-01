package web.com.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import web.com.exception.ErrorResponse;
import web.com.model.Staff;

import java.util.List;

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
        @QueryParam("role")   String role,
        @QueryParam("shift")  String shift,
        @QueryParam("search") String search
    ) {
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
        entity.fullName  = body.fullName;
        entity.role  = body.role;
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
        if (!deleted) throw notFound(id);
        return Response.noContent().build(); // 204
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private Staff findOrThrow(Long id) {
        Staff s = Staff.findById(id);
        if (s == null) throw notFound(id);
        return s;
    }

    private WebApplicationException notFound(Long id) {
        return new WebApplicationException(
            Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("Không tìm thấy nhân viên với id = " + id))
                    .build()
        );
    }
}