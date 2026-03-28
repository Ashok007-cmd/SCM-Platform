package com.scmplatform.controller;

import com.scmplatform.dto.ShipmentDto;
import com.scmplatform.dto.CreateShipmentRequest;
import com.scmplatform.dto.ShipmentEventDto;
import com.scmplatform.service.LogisticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST API — Logistics & Shipment Tracking Module
 * Handles shipment creation, real-time tracking, and carrier events
 */
@RestController
@RequestMapping("/api/v1/logistics")
@RequiredArgsConstructor
public class LogisticsController {

    private final LogisticsService logisticsService;

    /** List all shipments with filters */
    @GetMapping("/shipments")
    public ResponseEntity<Page<ShipmentDto>> listShipments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String carrier,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(logisticsService.findAll(status, carrier, pageable));
    }

    /** Get shipment by ID with full event timeline */
    @GetMapping("/shipments/{id}")
    public ResponseEntity<ShipmentDto> getShipment(@PathVariable UUID id) {
        return ResponseEntity.ok(logisticsService.findById(id));
    }

    /** Track shipment by tracking number (public endpoint) */
    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ShipmentDto> trackShipment(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(logisticsService.findByTrackingNumber(trackingNumber));
    }

    /** Create a new shipment for an order */
    @PostMapping("/shipments")
    public ResponseEntity<ShipmentDto> createShipment(@Valid @RequestBody CreateShipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(logisticsService.createShipment(request));
    }

    /** Record a tracking event (webhook from carrier) */
    @PostMapping("/shipments/{id}/events")
    public ResponseEntity<ShipmentDto> recordEvent(
            @PathVariable UUID id,
            @Valid @RequestBody ShipmentEventDto event) {
        return ResponseEntity.ok(logisticsService.recordEvent(id, event));
    }

    /** Mark shipment as delivered */
    @PostMapping("/shipments/{id}/deliver")
    public ResponseEntity<ShipmentDto> markDelivered(@PathVariable UUID id) {
        return ResponseEntity.ok(logisticsService.markDelivered(id));
    }

    /** Get shipment event timeline */
    @GetMapping("/shipments/{id}/events")
    public ResponseEntity<List<ShipmentEventDto>> getEvents(@PathVariable UUID id) {
        return ResponseEntity.ok(logisticsService.getEvents(id));
    }

    /** Get delayed shipments needing attention */
    @GetMapping("/shipments/delayed")
    public ResponseEntity<Page<ShipmentDto>> getDelayed(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(logisticsService.findDelayed(pageable));
    }

    /** Logistics KPI dashboard */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(logisticsService.getDashboardStats());
    }
}
