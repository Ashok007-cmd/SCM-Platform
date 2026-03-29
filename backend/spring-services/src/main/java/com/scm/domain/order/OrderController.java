package com.scm.domain.order;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService service;

    @GetMapping
    public Page<Order> list(
            @RequestParam(required = false) Order.OrderStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            Pageable pageable) {
        return service.search(status, search, from, to, pageable);
    }

    @GetMapping("/{id}")
    public Order get(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return service.getStats();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<Order> create(@Valid @RequestBody Order order) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(order));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','OPERATIONS_MANAGER')")
    public Order confirm(@PathVariable UUID id) {
        return service.updateStatus(id, Order.OrderStatus.CONFIRMED);
    }

    @PostMapping("/{id}/ship")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATIONS_MANAGER')")
    public Order ship(@PathVariable UUID id,
                      @RequestParam(required = false) String trackingNumber) {
        return service.updateStatus(id, Order.OrderStatus.SHIPPED);
    }

    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATIONS_MANAGER')")
    public Order deliver(@PathVariable UUID id) {
        return service.updateStatus(id, Order.OrderStatus.DELIVERED);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','OPERATIONS_MANAGER')")
    public Order cancel(@PathVariable UUID id,
                        @RequestParam(required = false) String reason) {
        return service.updateStatus(id, Order.OrderStatus.CANCELLED);
    }

    @GetMapping("/stats/trend")
    public List<Map<String, Object>> statsTrend(@RequestParam(defaultValue = "30") int days) {
        return service.getOrderTrend(days);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATIONS_MANAGER','SALES_MANAGER')")
    public Order updateStatus(@PathVariable UUID id,
                               @RequestParam Order.OrderStatus status) {
        return service.updateStatus(id, status);
    }
}
