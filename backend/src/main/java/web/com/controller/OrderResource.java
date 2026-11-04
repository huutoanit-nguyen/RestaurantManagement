package web.com.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import web.com.exception.ErrorResponse;
import web.com.model.MenuItem;
import web.com.model.Order;
import web.com.model.OrderItem;
import web.com.model.TableEntity;
import web.com.security.Roles;
import web.com.security.TenantContext;
import web.com.websocket.WebSocketBroadcaster;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Path("/api/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrderResource {

    @Inject TenantContext tenant;
    @Inject WebSocketBroadcaster broadcaster;

    // ── Request records ───────────────────────────────────────────────────────
    public record OrderItemRequest(Long menuItemId, int quantity) {}
    public record CreateOrderRequest(Long tableId, List<OrderItemRequest> items) {}
    public record AddItemsRequest(List<OrderItemRequest> items) {}

    // GET /api/orders?tableId=1&status=PENDING
    @GET
    @RolesAllowed({ Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN, Roles.BEP })
    public List<Order> getAll(
        @QueryParam("tableId") Long tableId,
        @QueryParam("status")  String status
    ) {
        Long rid = tenant.restaurantId();
        if (tableId != null && status != null)
            return Order.find("restaurantId = ?1 and tableId = ?2 and status = ?3", rid, tableId, status).list();
        if (tableId != null) return Order.find("restaurantId = ?1 and tableId = ?2", rid, tableId).list();
        if (status != null)  return Order.find("restaurantId = ?1 and status = ?2", rid, status).list();
        return Order.list("restaurantId", rid);
    }

    // GET /api/orders/{id}
    @GET
    @Path("/{id}")
    @RolesAllowed({ Roles.QUAN_LY, Roles.PHUC_VU, Roles.THU_NGAN, Roles.BEP })
    public Order getById(@PathParam("id") Long id) {
        return findOrThrow(id);
    }

    // POST /api/orders — tạo order mới khi khách bắt đầu gọi món
    @POST
    @Transactional
    @RolesAllowed({ Roles.QUAN_LY, Roles.PHUC_VU })
    public Response create(CreateOrderRequest req) {
        Long rid = tenant.restaurantId();

        // 1. Bàn phải thuộc nhà hàng này
        TableEntity table = TableEntity.findByIdAndRestaurant(req.tableId(), rid);
        if (table == null) {
            throw new WebApplicationException(
                Response.status(400).entity(new ErrorResponse("Bàn không tồn tại")).build());
        }

        Order order = new Order();
        order.restaurantId = rid;            // 2. Từ token
        order.tableId = req.tableId();
        order.status  = "PENDING";

        if (req.items() != null) {
            for (OrderItemRequest i : req.items()) {
                if (i.quantity() <= 0) throw bad("Số lượng phải lớn hơn 0");

                // 3. Lấy tên và GIÁ từ DB, không tin client
                MenuItem m = MenuItem.find("id = ?1 and restaurantId = ?2", i.menuItemId(), rid).firstResult();
                if (m == null) throw bad("Món không tồn tại: " + i.menuItemId());

                OrderItem item = new OrderItem();
                item.order = order;
                item.menuItemId = m.id;
                item.name = m.name;
                item.price = m.price;
                item.quantity = i.quantity();
                order.items.add(item);
            }
        }

        order.recalculateTotal();
        order.persist();

        // Cập nhật trạng thái bàn sang OCCUPIED
        table.status = "OCCUPIED";

        broadcaster.broadcast(rid, "ORDER_CREATED", order);
        broadcaster.broadcast(rid, "TABLE_UPDATED", table);

        return Response.status(Response.Status.CREATED).entity(order).build();
    }

    // POST /api/orders/{id}/items — thêm món vào order đang mở
    @POST
    @Path("/{id}/items")
    @Transactional
    @RolesAllowed({ Roles.QUAN_LY, Roles.PHUC_VU })
    public Order addItems(@PathParam("id") Long id, AddItemsRequest req) {
        Long rid = tenant.restaurantId();
        Order order = findOrThrow(id);
        if ("PAID".equals(order.status)) {
            throw new WebApplicationException(
                Response.status(400).entity(new ErrorResponse("Order đã thanh toán")).build()
            );
        }

        if (req.items() != null) {
            for (OrderItemRequest i : req.items()) {
                if (i.quantity() <= 0) throw bad("Số lượng phải lớn hơn 0");

                MenuItem m = MenuItem.find("id = ?1 and restaurantId = ?2", i.menuItemId(), rid).firstResult();
                if (m == null) throw bad("Món không tồn tại: " + i.menuItemId());

                // Nếu món đã có thì tăng quantity
                order.items.stream()
                    .filter(existing -> existing.menuItemId.equals(i.menuItemId()))
                    .findFirst()
                    .ifPresentOrElse(
                        existing -> existing.quantity += i.quantity(),
                        () -> {
                            OrderItem item = new OrderItem();
                            item.order      = order;
                            item.menuItemId = m.id;
                            item.name       = m.name;
                            item.price      = m.price;
                            item.quantity   = i.quantity();
                            order.items.add(item);
                        }
                    );
            }
        }

        order.recalculateTotal();
        broadcaster.broadcast(rid, "ORDER_UPDATED", order);
        return order;
    }

    // PUT /api/orders/{id}/pay — thanh toán
    @PUT
    @Path("/{id}/pay")
    @Transactional
    @RolesAllowed({ Roles.QUAN_LY, Roles.THU_NGAN })
    public Order pay(@PathParam("id") Long id) {
        Order order = findOrThrow(id);
        if ("PAID".equals(order.status)) {
            throw new WebApplicationException(
                Response.status(400).entity(new ErrorResponse("Order đã được thanh toán rồi")).build()
            );
        }
        order.status = "PAID";
        order.paidAt = LocalDateTime.now();

        // Đồng bộ bàn sang AVAILABLE
        TableEntity table = TableEntity.findByIdAndRestaurant(order.tableId, order.restaurantId);
        if (table != null) {
            table.status = "AVAILABLE";
            broadcaster.broadcast(order.restaurantId, "TABLE_UPDATED", table);
        }

        broadcaster.broadcast(order.restaurantId, "ORDER_PAID", order);
        return order;
    }

    // DELETE /api/orders/{id} — huỷ order (chỉ quản lý)
    @DELETE
    @Path("/{id}")
    @Transactional
    @RolesAllowed(Roles.QUAN_LY)
    public Response delete(@PathParam("id") Long id) {
        Order order = findOrThrow(id);
        Long rid = tenant.restaurantId();
        order.delete();
        broadcaster.broadcast(rid, "ORDER_DELETED", Map.of("id", id));
        return Response.noContent().build();
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private Order findOrThrow(Long id) {
        Order o = Order.find("id = ?1 and restaurantId = ?2", id, tenant.restaurantId()).firstResult();
        if (o == null) {
            throw new WebApplicationException(
                Response.status(404).entity(new ErrorResponse("Không tìm thấy order id = " + id)).build()
            );
        }
        return o;
    }

    private WebApplicationException bad(String message) {
        return new WebApplicationException(
            Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse(message)).build()
        );
    }
}
