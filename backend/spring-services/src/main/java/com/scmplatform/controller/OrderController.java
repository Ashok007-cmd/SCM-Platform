package com.scmplatform.controller;

import com.scmplatform.dto.OrderDto;
import com.scmplatform.dto.CreateOrderRequest;
import com.scmplatform.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

/**
 * REST API — Order Management Module
 * Handles customer order lifecycle from draft to delivery
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** Paginated order list with filters */
    @GetMapping
    public ResponseEntity<Page<OrderDto>> listOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @PageableDefault(size = 20, sort = "orderDate") Pageable pageable) {
        return ResponseEntity.ok(orderService.findAll(status, customerId, fromDate, toDate, pageable));
    }

    /** Get single order with all items */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    /** Create new sales order */
    @PostMapping
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    /** Confirm a draft order (triggers inventory reservation + Kafka event) */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<OrderDto> confirmOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.confirmOrder(id));
    }

    /** Mark order as shipped */
    @PostMapping("/{id}/ship")
    public ResponseEntity<OrderDto> shipOrder(
            @PathVariable UUID id,
            @RequestParam String trackingNumber) {
        return ResponseEntity.ok(orderService.shipOrder(id, trackingNumber));
    }

    /** Mark order as delivered */
    @PostMapping("/{id}/deliver")
    public ResponseEntity<OrderDto> deliverOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.deliverOrder(id));
    }

    /** Cancel order (releases inventory reservation) */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(orderService.cancelOrder(id, reason));
    }

    /** Order analytics dashboard */
    @GetMapping("/stats")
    public ResponseEntity<?> getOrderStats(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate) {
        return ResponseEntity.ok(orderService.getDashboardStats(fromDate, toDate));
    }
}
