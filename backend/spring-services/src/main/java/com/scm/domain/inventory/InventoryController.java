package com.scm.domain.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService service;

    @GetMapping
    public Page<InventoryItem> list(
            @RequestParam(required = false) String sku,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return service.search(sku, category, status, pageable);
    }

    @GetMapping("/{id}")
    public InventoryItem get(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return service.getStats();
    }

    @GetMapping("/low-stock")
    public List<InventoryItem> lowStock() {
        return service.getLowStock();
    }

    @PostMapping("/{id}/reserve")
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE_MANAGER','OPERATIONS_MANAGER')")
    public ResponseEntity<InventoryItem> reserve(
            @PathVariable UUID id,
            @RequestParam int quantity) {
        return ResponseEntity.ok(service.reserveQuantity(id, quantity));
    }

    @PatchMapping("/{id}/adjust")
    @PreAuthorize("hasAnyRole('ADMIN','WAREHOUSE_MANAGER')")
    public ResponseEntity<InventoryItem> adjust(
            @PathVariable UUID id,
            @RequestParam int delta) {
        return ResponseEntity.ok(service.adjustQuantity(id, delta));
    }

    @GetMapping("/stats/flow")
    public List<Map<String, Object>> statsFlow(
            @RequestParam(defaultValue = "30") int days) {
        return service.getInventoryFlow(days);
    }

    @GetMapping("/top")
    public List<Map<String, Object>> topProducts(
            @RequestParam(defaultValue = "5") int limit) {
        return service.getTopProducts(limit);
    }
}
