package com.scmplatform.controller;

import com.scmplatform.dto.SupplierDto;
import com.scmplatform.dto.CreateSupplierRequest;
import com.scmplatform.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST API — Supplier Management Module
 * Handles supplier onboarding, rating, risk scoring, and lifecycle
 */
@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    /** List suppliers with search and filter */
    @GetMapping
    public ResponseEntity<Page<SupplierDto>> listSuppliers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String riskLevel,
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(supplierService.findAll(search, status, country, riskLevel, pageable));
    }

    /** Get supplier details by ID */
    @GetMapping("/{id}")
    public ResponseEntity<SupplierDto> getSupplier(@PathVariable UUID id) {
        return ResponseEntity.ok(supplierService.findById(id));
    }

    /** Onboard a new supplier */
    @PostMapping
    public ResponseEntity<SupplierDto> createSupplier(@Valid @RequestBody CreateSupplierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.create(request));
    }

    /** Update supplier details */
    @PutMapping("/{id}")
    public ResponseEntity<SupplierDto> updateSupplier(
            @PathVariable UUID id,
            @Valid @RequestBody CreateSupplierRequest request) {
        return ResponseEntity.ok(supplierService.update(id, request));
    }

    /** Approve a pending supplier */
    @PostMapping("/{id}/approve")
    public ResponseEntity<SupplierDto> approveSupplier(@PathVariable UUID id) {
        return ResponseEntity.ok(supplierService.approve(id));
    }

    /** Update supplier performance rating */
    @PatchMapping("/{id}/rating")
    public ResponseEntity<SupplierDto> updateRating(
            @PathVariable UUID id,
            @RequestParam double rating) {
        return ResponseEntity.ok(supplierService.updateRating(id, rating));
    }

    /** Get preferred suppliers for a product category */
    @GetMapping("/preferred")
    public ResponseEntity<Page<SupplierDto>> getPreferred(
            @RequestParam(required = false) String category,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(supplierService.findPreferred(category, pageable));
    }

    /** Supplier performance analytics */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(supplierService.getDashboardStats());
    }
}
