package web.com.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import web.com.model.Order;
import web.com.security.Roles;
import web.com.security.TenantContext;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Path("/api/reports")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed({ Roles.CHU_CUA_HANG, Roles.QUAN_LY })
public class ReportResource {

    @Inject
    TenantContext tenant;

    // GET /api/reports/summary — tổng hợp hôm nay
    @GET
    @Path("/summary")
    public Map<String, Object> getSummary() {
        Long rid = tenant.restaurantId();
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        // Query database với restaurantId
        List<Order> todayOrders = Order.find(
                "restaurantId = ?1 and status = 'PAID' and paidAt >= ?2 and paidAt < ?3",
                rid, startOfDay, endOfDay).list();

        long revenueToday = todayOrders.stream().mapToLong(o -> o.total).sum();
        long totalOrders = todayOrders.size();
        long totalDishes = todayOrders.stream()
                .flatMap(o -> o.items.stream())
                .mapToLong(i -> i.quantity)
                .sum();

        // Tăng trưởng so với hôm qua
        LocalDateTime startOfYesterday = startOfDay.minusDays(1);
        List<Order> yesterdayOrders = Order.find(
                "restaurantId = ?1 and status = 'PAID' and paidAt >= ?2 and paidAt < ?3",
                rid, startOfYesterday, startOfDay).list();
        long revenueYesterday = yesterdayOrders.stream().mapToLong(o -> o.total).sum();
        double growth = revenueYesterday == 0 ? 0
                : ((revenueToday - revenueYesterday) * 100.0 / revenueYesterday);

        return Map.of(
                "revenueToday", revenueToday,
                "totalOrders", totalOrders,
                "totalDishes", totalDishes,
                "growthPercent", Math.round(growth * 10.0) / 10.0);
    }

    // GET /api/reports/weekly — doanh thu 7 ngày gần nhất
    @GET
    @Path("/weekly")
    public List<Map<String, Object>> getWeekly() {
        Long rid = tenant.restaurantId();
        String[] dayNames = { "CN", "T2", "T3", "T4", "T5", "T6", "T7" };
        List<Map<String, Object>> weeklyData = new ArrayList<>();

        for (int i = 0; i <= 6; i++) {
            LocalDate date = LocalDate.now().minusDays(6 - i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = start.plusDays(1);

            List<Order> orders = Order.find(
                "restaurantId = ?1 and status = 'PAID' and paidAt >= ?2 and paidAt < ?3",
                rid, start, end
            ).list();

            long revenue = orders.stream().mapToLong(o -> o.total).sum();
            String dayName = dayNames[date.getDayOfWeek().getValue() % 7];

            weeklyData.add(Map.of("day", dayName, "revenue", revenue));
        }

        return weeklyData;
    }
}
