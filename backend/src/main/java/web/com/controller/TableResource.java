package web.com.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import web.com.exception.ErrorResponse;
import web.com.model.TableEntity;
import web.com.security.Roles;
import web.com.security.TenantContext;
import web.com.websocket.WebSocketBroadcaster;

import java.util.List;
import java.util.Map;

@Path("/api/tables")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TableResource {

    @Inject TenantContext tenant;
    @Inject WebSocketBroadcaster broadcaster;

    // ==================== GET ALL ====================
    @GET
    @RolesAllowed({ Roles.CHU_CUA_HANG, Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN })
    public Response getAll(@QueryParam("status") String status) {
        Long rid = tenant.restaurantId();
        List<TableEntity> tables;

        if (status != null && !status.isBlank()) {
            tables = TableEntity.findByStatus(rid, status.toUpperCase());
        } else {
            tables = TableEntity.listByRestaurant(rid);
        }

        return Response.ok(tables).build();
    }

    // ==================== GET BY ID ====================
    @GET
    @Path("/{id}")
    @RolesAllowed({ Roles.CHU_CUA_HANG, Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN })
    public Response getById(@PathParam("id") Long id) {
        TableEntity table = TableEntity.findByIdAndRestaurant(id, tenant.restaurantId());

        if (table == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("Table not found with id: " + id))
                    .build();
        }

        return Response.ok(table).build();
    }

    // ==================== POST (CREATE) ====================
    @POST
    @Transactional
    @RolesAllowed({ Roles.CHU_CUA_HANG, Roles.QUAN_LY })
    public Response create(@Valid TableEntity table) {
        if (table == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Request body is required"))
                    .build();
        }
        if (table.capacity != null && table.capacity <= 0) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Sức chứa phải lớn hơn 0"))
                    .build();
        }

        // Validate required fields
        if (table.tableNumber == null || table.capacity == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("tableNumber and capacity are required"))
                    .build();
        }

        Long rid = tenant.restaurantId();

        // Check duplicate table number trong nhà hàng
        TableEntity existing = TableEntity.findByTableNumber(rid, table.tableNumber);
        if (existing != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse("Table number " + table.tableNumber + " already exists"))
                    .build();
        }

        table.id = null;
        table.restaurantId = rid;

        // Default status if not provided
        if (table.status == null || table.status.isBlank()) {
            table.status = "AVAILABLE";
        }

        table.persist();
        broadcaster.broadcast(rid, "TABLE_CREATED", table);
        return Response.status(Response.Status.CREATED).entity(table).build();
    }

    // ==================== PUT (UPDATE) ====================
    @PUT
    @Path("/{id}")
    @Transactional
    @RolesAllowed({ Roles.CHU_CUA_HANG, Roles.QUAN_LY })
    public Response update(@PathParam("id") Long id, TableEntity updated) {
        if (updated == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Request body is required"))
                    .build();
        }

        Long rid = tenant.restaurantId();
        TableEntity table = TableEntity.findByIdAndRestaurant(id, rid);
        if (table == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("Table not found with id: " + id))
                    .build();
        }

        if (updated.capacity != null && updated.capacity <= 0) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Sức chứa phải lớn hơn 0"))
                    .build();
        }

        // Kiểm tra trùng lặp số bàn (loại trừ chính nó)
        if (updated.tableNumber != null && !updated.tableNumber.equals(table.tableNumber)) {
            TableEntity existing = TableEntity.findByTableNumber(rid, updated.tableNumber);
            if (existing != null) {
                return Response.status(Response.Status.CONFLICT)
                        .entity(new ErrorResponse("Table number " + updated.tableNumber + " already exists"))
                        .build();
            }
        }

        if (updated.tableNumber != null)
            table.tableNumber = updated.tableNumber;
        if (updated.capacity != null)
            table.capacity = updated.capacity;
        if (updated.location != null)
            table.location = updated.location;
        if (updated.status != null)
            table.status = updated.status.toUpperCase();

        broadcaster.broadcast(rid, "TABLE_UPDATED", table);
        return Response.ok(table).build();
    }

    // ==================== PATCH STATUS ====================
    @PATCH
    @Path("/{id}/status")
    @Transactional
    @RolesAllowed({ Roles.CHU_CUA_HANG, Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN })
    public Response updateStatus(@PathParam("id") Long id, @QueryParam("status") String status) {
        if (status == null || status.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Query param 'status' is required"))
                    .build();
        }

        TableEntity table = TableEntity.findByIdAndRestaurant(id, tenant.restaurantId());
        if (table == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("Table not found with id: " + id))
                    .build();
        }

        List<String> validStatuses = List.of("AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE");
        if (!validStatuses.contains(status.toUpperCase())) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Invalid status. Must be one of: " + validStatuses))
                    .build();
        }

        table.status = status.toUpperCase();
        broadcaster.broadcast(tenant.restaurantId(), "TABLE_UPDATED", table);
        return Response.ok(table).build();
    }

    // ==================== DELETE ====================
    @DELETE
    @Path("/{id}")
    @Transactional
    @RolesAllowed({ Roles.CHU_CUA_HANG, Roles.QUAN_LY })
    public Response delete(@PathParam("id") Long id) {
        TableEntity table = TableEntity.findByIdAndRestaurant(id, tenant.restaurantId());

        if (table == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(new ErrorResponse("Table not found with id: " + id))
                    .build();
        }

        if ("OCCUPIED".equals(table.status)) {
            return Response.status(Response.Status.CONFLICT)
                    .entity(new ErrorResponse("Cannot delete table that is currently OCCUPIED"))
                    .build();
        }

        table.delete();
        broadcaster.broadcast(tenant.restaurantId(), "TABLE_DELETED", Map.of("id", id));
        return Response.noContent().build();
    }
}
