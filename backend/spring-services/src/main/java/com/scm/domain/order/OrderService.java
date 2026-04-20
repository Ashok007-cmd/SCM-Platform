package com.scm.domain.order;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository repo;

    public Page<Order> search(Order.OrderStatus status, String search,
                               Instant from, Instant to, Pageable pageable) {
        return repo.search(status, search, from, to, pageable);
    }

    public Order findById(UUID id) {
        return repo.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Order not found: " + id));
    }

    @Cacheable("order-stats")
    public Map<String, Object> getStats() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        
        List<OrderRepository.OrderStatusCount> counts = repo.getOrderStatusCounts();
        long total = 0;
        long pending = 0;
        long processing = 0;
        long shipped = 0;
        long delivered = 0;
        long cancelled = 0;

        for (OrderRepository.OrderStatusCount c : counts) {
            total += c.getCount();
            if ("PENDING".equals(c.getStatus())) pending += c.getCount();
            if ("PROCESSING".equals(c.getStatus())) processing += c.getCount();
            if ("SHIPPED".equals(c.getStatus())) shipped += c.getCount();
            if ("DELIVERED".equals(c.getStatus())) delivered += c.getCount();
            if ("CANCELLED".equals(c.getStatus())) cancelled += c.getCount();
        }

        return Map.ofEntries(
            Map.entry("total",           total),
            Map.entry("pending",         pending),
            Map.entry("pendingApproval", pending),
            Map.entry("processing",      processing),
            Map.entry("shipped",         shipped),
            Map.entry("delivered",       delivered),
            Map.entry("cancelled",       cancelled),
            Map.entry("revenue30d",      repo.revenueSince(thirtyDaysAgo)),
            Map.entry("changePercent",   0)
        );
    }

    @Cacheable(value = "order-trend", key = "#days")
    public List<Map<String, Object>> getOrderTrend(int days) {
        List<Map<String, Object>> trend = new ArrayList<>();
        Instant start = Instant.now().minus(days, ChronoUnit.DAYS);
        Instant end = Instant.now();
        
        List<OrderRepository.OrderTrendData> data = repo.getOrderTrendData(start, end);
        Map<String, Long> dateToOrders = data.stream()
            .collect(java.util.stream.Collectors.toMap(
                d -> d.getDate().toString(),
                OrderRepository.OrderTrendData::getOrders
            ));

        for (int i = 0; i < days; i++) {
            Instant from = start.plus(i, ChronoUnit.DAYS);
            LocalDate day = from.atZone(ZoneOffset.UTC).toLocalDate();
            String dateStr = day.toString();
            trend.add(Map.of("date", dateStr, "orders", dateToOrders.getOrDefault(dateStr, 0L)));
        }
        return trend;
    }

    @Transactional
    @CacheEvict(value = {"order-stats", "order-trend"}, allEntries = true)
    public Order create(Order order) {
        order.recalculateTotal();
        return repo.save(order);
    }

    @Transactional
    @CacheEvict(value = {"order-stats", "order-trend"}, allEntries = true)
    public Order updateStatus(UUID id, Order.OrderStatus newStatus) {
        return updateStatus(id, newStatus, null);
    }

    @Transactional
    public Order updateStatus(UUID id, Order.OrderStatus newStatus, String trackingNumber) {
        Order order = findById(id);
        order.setStatus(newStatus);
        if (newStatus == Order.OrderStatus.SHIPPED) {
            order.setShippedAt(Instant.now());
            if (trackingNumber != null) {
                order.setTrackingNumber(trackingNumber);
            }
        }
        if (newStatus == Order.OrderStatus.DELIVERED) order.setDeliveredAt(Instant.now());
        return repo.save(order);
    }
}
