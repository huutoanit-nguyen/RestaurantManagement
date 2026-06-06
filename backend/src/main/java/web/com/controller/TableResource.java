package web.com.controller;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import web.com.exception.ErrorResponse;
import web.com.model.TableEntity;

import java.util.List;

@Path("/api/tables")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TableResource {

    // ==================== GET ALL ====================
    @GET
    public Response getAll(@QueryParam("status") String status) {
        List<TableEntity> tables;

        if (status != null && !status.isBlank()) {
            tables = TableEntity.findByStatus(status.toUpperCase());
        } else {
            tables = TableEntity.listAll();
        }

        return Response.ok(tables).build();
    }

    // ==================== GET BY ID ====================
    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        TableEntity table = TableEntity.findById(id);

        if (table == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"message\": \"Table not found with id: " + id + "\"}")
                    .build();
        }

        return Response.ok(table).build();
    }

    // ==================== POST (CREATE) ====================
    @POST
    @Transactional
    public Response create(TableEntity table) {
        if (table == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"message\": \"Request body is required\"}")
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
                    .entity("{\"message\": \"tableNumber and capacity are required\"}")
                    .build();
        }

        // Check duplicate table number
        TableEntity existing = TableEntity.findByTableNumber(table.tableNumber);
        if (existing != null) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"message\": \"Table number " + table.tableNumber + " already exists\"}")
                    .build();
        }

        // Default status if not provided
        if (table.status == null || table.status.isBlank()) {
            table.status = "AVAILABLE";
        }

        table.persist();
        return Response.status(Response.Status.CREATED).entity(table).build();
    }

    // ==================== PUT (UPDATE) ====================
    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, TableEntity updated) {
        // 1. Kiểm tra xem Body gửi lên có rỗng không
        if (updated == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"message\": \"Request body is required\"}")
                    .build();
        }

        // 2. Tìm bàn ăn thực tế trong Database
        TableEntity table = TableEntity.findById(id);
        if (table == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"message\": \"Table not found with id: " + id + "\"}")
                    .build();
        }

        // 3. Kiểm tra ràng buộc dữ liệu sức chứa mới
        if (updated.capacity != null && updated.capacity <= 0) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ErrorResponse("Sức chứa phải lớn hơn 0"))
                    .build();
        }

        // 4. Kiểm tra trùng lặp số bàn (loại trừ chính nó)
        if (updated.tableNumber != null && !updated.tableNumber.equals(table.tableNumber)) {
            TableEntity existing = TableEntity.findByTableNumber(updated.tableNumber);
            if (existing != null) {
                return Response.status(Response.Status.CONFLICT)
                        .entity("{\"message\": \"Table number " + updated.tableNumber + " already exists\"}")
                        .build();
            }
        }

        // 5. Tiến hành cập nhật các trường dữ liệu
        if (updated.tableNumber != null)
            table.tableNumber = updated.tableNumber;
        if (updated.capacity != null)
            table.capacity = updated.capacity;
        if (updated.location != null)
            table.location = updated.location;
        if (updated.status != null)
            table.status = updated.status.toUpperCase();

        return Response.ok(table).build();
    }

    // ==================== PATCH STATUS ====================
    @PATCH
    @Path("/{id}/status")
    @Transactional
    public Response updateStatus(@PathParam("id") Long id, @QueryParam("status") String status) {
        if (status == null || status.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"message\": \"Query param 'status' is required\"}")
                    .build();
        }

        TableEntity table = TableEntity.findById(id);
        if (table == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"message\": \"Table not found with id: " + id + "\"}")
                    .build();
        }

        List<String> validStatuses = List.of("AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE");
        if (!validStatuses.contains(status.toUpperCase())) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"message\": \"Invalid status. Must be one of: " + validStatuses + "\"}")
                    .build();
        }

        table.status = status.toUpperCase();
        return Response.ok(table).build();
    }

    // ==================== DELETE ====================
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        TableEntity table = TableEntity.findById(id);

        if (table == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"message\": \"Table not found with id: " + id + "\"}")
                    .build();
        }

        // Ngăn chặn xóa nếu bàn đang có khách ngồi (OCCUPIED)
        if ("OCCUPIED".equals(table.status)) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"message\": \"Cannot delete table that is currently OCCUPIED\"}")
                    .build();
        }

        table.delete();
        return Response.noContent().build(); // 204 No Content
    }
}