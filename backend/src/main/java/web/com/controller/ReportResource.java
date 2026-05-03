package web.com.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import web.com.model.Order;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Path("/api/reports")
@Produces(MediaType.APPLICATION_JSON)
@RolesAllowed("Quản lý") 
public class ReportResource {

    // GET /api/reports/summary — tổng hợp hôm nay
    @GET
    @Path("/summary")
    public Map<String, Object> getSummary() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = startOfDay.plusDays(1);

        List<Order> todayOrders = Order.find(
            "status = 'PAID' and paidAt >= ?1 and paidAt < ?2",
            startOfDay, endOfDay
        ).list();

        long revenueToday = todayOrders.stream().mapToLong(o -> o.total).sum();
        long totalOrders  = todayOrders.size();
        long totalDishes  = todayOrders.stream()
            .flatMap(o -> o.items.stream())
            .mapToLong(i -> i.quantity)
            .sum();

        // Tăng trưởng so với hôm qua
        LocalDateTime startOfYesterday = startOfDay.minusDays(1);
        List<Order> yesterdayOrders = Order.find(
            "status = 'PAID' and paidAt >= ?1 and paidAt < ?2",
            startOfYesterday, startOfDay
        ).list();
        long revenueYesterday = yesterdayOrders.stream().mapToLong(o -> o.total).sum();
        double growth = revenueYesterday == 0 ? 0
            : ((revenueToday - revenueYesterday) * 100.0 / revenueYesterday);

        return Map.of(
            "revenueToday",  revenueToday,
            "totalOrders",   totalOrders,
            "totalDishes",   totalDishes,
            "growthPercent", Math.round(growth * 10.0) / 10.0
        );
    }

    // GET /api/reports/weekly — doanh thu 7 ngày gần nhất
    @GET
    @Path("/weekly")
    public List<Map<String, Object>> getWeekly() {
        String[] dayNames = { "CN", "T2", "T3", "T4", "T5", "T6", "T7" };

        return java.util.stream.IntStream.rangeClosed(0, 6)
            .mapToObj(i -> {
                LocalDate date  = LocalDate.now().minusDays(6 - i);
                LocalDateTime start = date.atStartOfDay();
                LocalDateTime end   = start.plusDays(1);

                List<Order> orders = Order.find(
                    "status = 'PAID' and paidAt >= ?1 and paidAt < ?2",
                    start, end
                ).list();

                long revenue = orders.stream().mapToLong(o -> o.total).sum();
                String dayName = dayNames[date.getDayOfWeek().getValue() % 7];

                return Map.<String, Object>of("day", dayName, "revenue", revenue);
            })
            .toList();
    }
}