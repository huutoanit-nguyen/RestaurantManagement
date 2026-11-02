package web.com.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import web.com.exception.ErrorResponse;
import web.com.model.MenuItem;
import web.com.security.Roles;
import web.com.security.TenantContext;

import java.util.List;

@Path("/api/menu-items")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MenuItemResource {

    @Inject TenantContext tenant;

    // GET /api/menu-items?category=$&search=$
    @GET
    @RolesAllowed({ Roles.CHU_CUA_HANG, Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN, Roles.BEP })
    public List<MenuItem> getAll(
        @QueryParam("category") String category,
        @QueryParam("search")   String search
    ) {
        Long rid = tenant.restaurantId();
        if (category != null && search != null)
            return MenuItem.find("restaurantId = ?1 and category = ?2 and lower(name) like ?3",
                    rid, category, "%" + search.toLowerCase() + "%").list();
        if (category != null)
            return MenuItem.list("restaurantId = ?1 and category = ?2", rid, category);
        if (search != null)
            return MenuItem.find("restaurantId = ?1 and lower(name) like ?2",
                    rid, "%" + search.toLowerCase() + "%").list();
        return MenuItem.list("restaurantId", rid);
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({ Roles.CHU_CUA_HANG, Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN, Roles.BEP })
    public MenuItem getById(@PathParam("id") Long id) {
        return findOrThrow(id);
    }

    @POST
    @Transactional
    @RolesAllowed({ Roles.CHU_CUA_HANG, Roles.QUAN_LY })
    public Response create(@Valid MenuItem item) {
        item.id = null;
        item.restaurantId = tenant.restaurantId(); // ghi đè, bỏ qua giá trị client gửi
        item.persist();
        return Response.status(Response.Status.CREATED).entity(item).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @RolesAllowed({ Roles.CHU_CUA_HANG, Roles.QUAN_LY })
    public MenuItem update(@PathParam("id") Long id, @Valid MenuItem body) {
        MenuItem entity = findOrThrow(id);
        entity.name     = body.name;
        entity.category = body.category;
        entity.price    = body.price;
        return entity;
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @RolesAllowed({ Roles.CHU_CUA_HANG, Roles.QUAN_LY })
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = MenuItem.delete("id = ?1 and restaurantId = ?2", id, tenant.restaurantId()) > 0;
        if (!deleted) throw notFound(id);
        return Response.noContent().build();
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    private MenuItem findOrThrow(Long id) {
        MenuItem item = MenuItem.find("id = ?1 and restaurantId = ?2", id, tenant.restaurantId()).firstResult();
        if (item == null) throw notFound(id);
        return item;
    }

    private WebApplicationException notFound(Long id) {
        return new WebApplicationException(
            Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("Không tìm thấy món với id = " + id))
                    .build()
        );
    }
}
