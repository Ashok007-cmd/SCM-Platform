package com.scm.domain.order;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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

    public Map<String, Object> getStats() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        return Map.of(
            "total",      repo.count(),
            "pending",    repo.countByStatus(Order.OrderStatus.PENDING),
            "processing", repo.countByStatus(Order.OrderStatus.PROCESSING),
            "shipped",    repo.countByStatus(Order.OrderStatus.SHIPPED),
            "delivered",  repo.countByStatus(Order.OrderStatus.DELIVERED),
            "cancelled",  repo.countByStatus(Order.OrderStatus.CANCELLED),
            "revenue30d", repo.revenueS(thirtyDaysAgo)
        );
    }

    @Transactional
    public Order create(Order order) {
        order.recalculateTotal();
        return repo.save(order);
    }

    @Transactional
    public Order updateStatus(UUID id, Order.OrderStatus newStatus) {
        Order order = findById(id);
        order.setStatus(newStatus);
        if (newStatus == Order.OrderStatus.SHIPPED)   order.setShippedAt(Instant.now());
        if (newStatus == Order.OrderStatus.DELIVERED) order.setDeliveredAt(Instant.now());
        return repo.save(order);
    }
}
