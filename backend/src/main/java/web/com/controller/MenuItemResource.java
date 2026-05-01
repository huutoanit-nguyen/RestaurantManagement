package web.com.controller;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import web.com.model.MenuItem;
import web.com.exception.ErrorResponse;

import java.util.List;

@Path("/api/menu-items")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MenuItemResource {

    // GET /api/menu-items?category=Món chính&search=phở
    @GET
    public List<MenuItem> getAll(
        @QueryParam("category") String category,
        @QueryParam("search")   String search
    ) {
        if (category != null && search != null)
            return MenuItem.find("category = ?1 and lower(name) like ?2",
                category, "%" + search.toLowerCase() + "%").list();
        if (category != null)
            return MenuItem.list("category", category);
        if (search != null)
            return MenuItem.find("lower(name) like ?1",
                "%" + search.toLowerCase() + "%").list();
        return MenuItem.listAll();
    }

    @GET
    @Path("/{id}")
    public MenuItem getById(@PathParam("id") Long id) {
        return findOrThrow(id);
    }

    @POST
    @Transactional
    public Response create(@Valid MenuItem item) {
        item.id = null; // đảm bảo không override id cũ
        item.persist();
        return Response.status(Response.Status.CREATED).entity(item).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public MenuItem update(@PathParam("id") Long id, @Valid MenuItem body) {
        MenuItem entity = findOrThrow(id);
        entity.name     = body.name;
        entity.category = body.category;
        entity.price    = body.price;
        return entity; // Panache tự flush khi kết thúc @Transactional
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = MenuItem.deleteById(id);
        if (!deleted) throw notFound(id);
        return Response.noContent().build(); // 204
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    private MenuItem findOrThrow(Long id) {
        MenuItem item = MenuItem.findById(id);
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