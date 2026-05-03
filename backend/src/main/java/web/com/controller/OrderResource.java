package web.com.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import web.com.exception.ErrorResponse;
import web.com.model.Order;
import web.com.model.OrderItem;

import java.time.LocalDateTime;
import java.util.List;

@Path("/api/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrderResource {

    // ── Request records ───────────────────────────────────────────────────────
    public record OrderItemRequest(Long menuItemId, String name, long price, int quantity) {}
    public record CreateOrderRequest(Long tableId, List<OrderItemRequest> items) {}
    public record AddItemsRequest(List<OrderItemRequest> items) {}

    // GET /api/orders?tableId=1&status=PENDING
    @GET
    @RolesAllowed({ "Quản lý", "Phục vụ", "Thu ngân", "Bếp" })
    public List<Order> getAll(
        @QueryParam("tableId") Long tableId,
        @QueryParam("status")  String status
    ) {
        if (tableId != null && status != null)
            return Order.find("tableId = ?1 and status = ?2", tableId, status).list();
        if (tableId != null)
            return Order.find("tableId", tableId).list();
        if (status != null)
            return Order.find("status", status).list();
        return Order.listAll();
    }

    // GET /api/orders/{id}
    @GET
    @Path("/{id}")
    @RolesAllowed({ "Quản lý", "Phục vụ", "Thu ngân", "Bếp" })
    public Order getById(@PathParam("id") Long id) {
        return findOrThrow(id);
    }

    // POST /api/orders — tạo order mới khi khách bắt đầu gọi món
    @POST
    @Transactional
    @RolesAllowed({ "Quản lý", "Phục vụ" })
    public Response create(CreateOrderRequest req) {
        Order order = new Order();
        order.tableId = req.tableId();
        order.status  = "PENDING";

        for (OrderItemRequest i : req.items()) {
            OrderItem item  = new OrderItem();
            item.order      = order;
            item.menuItemId = i.menuItemId();
            item.name       = i.name();
            item.price      = i.price();
            item.quantity   = i.quantity();
            order.items.add(item);
        }

        order.recalculateTotal();
        order.persist();
        return Response.status(Response.Status.CREATED).entity(order).build();
    }

    // POST /api/orders/{id}/items — thêm món vào order đang mở
    @POST
    @Path("/{id}/items")
    @Transactional
    @RolesAllowed({ "Quản lý", "Phục vụ" })
    public Order addItems(@PathParam("id") Long id, AddItemsRequest req) {
        Order order = findOrThrow(id);
        if ("PAID".equals(order.status))
            throw new WebApplicationException(
                Response.status(400).entity(new ErrorResponse("Order đã thanh toán")).build()
            );

        for (OrderItemRequest i : req.items()) {
            // Nếu món đã có thì tăng quantity
            order.items.stream()
                .filter(existing -> existing.menuItemId.equals(i.menuItemId()))
                .findFirst()
                .ifPresentOrElse(
                    existing -> existing.quantity += i.quantity(),
                    () -> {
                        OrderItem item  = new OrderItem();
                        item.order      = order;
                        item.menuItemId = i.menuItemId();
                        item.name       = i.name();
                        item.price      = i.price();
                        item.quantity   = i.quantity();
                        order.items.add(item);
                    }
                );
        }

        order.recalculateTotal();
        return order;
    }

    // PUT /api/orders/{id}/pay — thanh toán
    @PUT
    @Path("/{id}/pay")
    @Transactional
    @RolesAllowed({ "Quản lý", "Thu ngân" })
    public Order pay(@PathParam("id") Long id) {
        Order order = findOrThrow(id);
        if ("PAID".equals(order.status))
            throw new WebApplicationException(
                Response.status(400).entity(new ErrorResponse("Order đã được thanh toán rồi")).build()
            );
        order.status = "PAID";
        order.paidAt = LocalDateTime.now();
        return order;
    }

    // DELETE /api/orders/{id} — huỷ order (chỉ quản lý)
    @DELETE
    @Path("/{id}")
    @Transactional
    @RolesAllowed("Quản lý")
    public Response delete(@PathParam("id") Long id) {
        Order order = findOrThrow(id);
        order.delete();
        return Response.noContent().build();
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private Order findOrThrow(Long id) {
        Order o = Order.findById(id);
        if (o == null) throw new WebApplicationException(
            Response.status(404).entity(new ErrorResponse("Không tìm thấy order id = " + id)).build()
        );
        return o;
    }
}