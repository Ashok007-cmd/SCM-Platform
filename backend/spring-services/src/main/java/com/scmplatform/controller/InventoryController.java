package com.scmplatform.controller;

import com.scmplatform.dto.InventoryDto;
import com.scmplatform.dto.InventoryUpdateRequest;
import com.scmplatform.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST API — Inventory Management Module
 * Handles real-time stock tracking, reorder alerts, and adjustments
 */
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    /** List all inventory items with pagination and optional warehouse filter */
    @GetMapping
    public ResponseEntity<Page<InventoryDto>> listInventory(
            @RequestParam(required = false) String warehouseCode,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "updatedAt") Pageable pageable) {
        return ResponseEntity.ok(inventoryService.findAll(warehouseCode, status, pageable));
    }

    /** Get single inventory record by ID */
    @GetMapping("/{id}")
    public ResponseEntity<InventoryDto> getInventory(@PathVariable UUID id) {
        return ResponseEntity.ok(inventoryService.findById(id));
    }

    /** Get inventory for a specific product across all warehouses */
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<InventoryDto>> getByProduct(
            @PathVariable UUID productId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(inventoryService.findByProduct(productId, pageable));
    }

    /** Get items below reorder point (triggers procurement alerts) */
    @GetMapping("/low-stock")
    public ResponseEntity<Page<InventoryDto>> getLowStock(
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(inventoryService.findLowStock(pageable));
    }

    /** Adjust stock quantity (receipt, issue, adjustment, transfer) */
    @PatchMapping("/{id}/adjust")
    public ResponseEntity<InventoryDto> adjustStock(
            @PathVariable UUID id,
            @Valid @RequestBody InventoryUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.adjustStock(id, request));
    }

    /** Reserve stock for an order */
    @PostMapping("/{id}/reserve")
    public ResponseEntity<InventoryDto> reserveStock(
            @PathVariable UUID id,
            @RequestParam int quantity) {
        return ResponseEntity.ok(inventoryService.reserveStock(id, quantity));
    }

    /** Release reserved stock (order cancelled / fulfilled) */
    @PostMapping("/{id}/release")
    public ResponseEntity<InventoryDto> releaseStock(
            @PathVariable UUID id,
            @RequestParam int quantity) {
        return ResponseEntity.ok(inventoryService.releaseStock(id, quantity));
    }

    /** Summary dashboard stats */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(inventoryService.getDashboardStats());
    }
}
