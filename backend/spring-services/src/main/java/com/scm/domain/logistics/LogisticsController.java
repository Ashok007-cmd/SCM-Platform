package com.scm.domain.logistics;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/logistics")
@RequiredArgsConstructor
public class LogisticsController {

    private final ShipmentService service;

    @GetMapping("/shipments")
    public Page<Shipment> list(
            @RequestParam(required = false) Shipment.ShipmentStatus status,
            @RequestParam(required = false) String carrier,
            Pageable pageable) {
        return service.search(status, carrier, pageable);
    }

    @GetMapping("/shipments/{id}")
    public Shipment get(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/track/{trackingNumber}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATIONS_MANAGER','WAREHOUSE_MANAGER','VIEWER','ANALYST')")
    public Shipment track(@PathVariable String trackingNumber) {
        return service.findByTrackingNumber(trackingNumber);
    }

    @GetMapping("/shipments/delayed")
    public List<Shipment> delayed() {
        return service.getDelayed();
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return service.getStats();
    }

    @PostMapping("/shipments")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATIONS_MANAGER','WAREHOUSE_MANAGER')")
    public ResponseEntity<Shipment> create(@Valid @RequestBody Shipment shipment) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(shipment));
    }

    @PostMapping("/shipments/{id}/deliver")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATIONS_MANAGER')")
    public Shipment deliver(@PathVariable UUID id) {
        return service.markDelivered(id);
    }
}
