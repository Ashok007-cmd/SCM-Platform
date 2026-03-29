package com.scm.domain.supplier;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService service;

    @GetMapping
    public Page<Supplier> list(
            @RequestParam(required = false) Supplier.SupplierStatus status,
            @RequestParam(required = false) Supplier.RiskLevel riskLevel,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return service.search(status, riskLevel, search, pageable);
    }

    @GetMapping("/{id}")
    public Supplier get(@PathVariable UUID id) {
        return service.findById(id);
    }

    @GetMapping("/stats")
    public Map<String, Long> stats() {
        return service.getStats();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT_MANAGER')")
    public ResponseEntity<Supplier> create(@Valid @RequestBody Supplier supplier) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(supplier));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT_MANAGER')")
    public Supplier update(@PathVariable UUID id, @Valid @RequestBody Supplier supplier) {
        return service.update(id, supplier);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','PROCUREMENT_MANAGER')")
    public Supplier approve(@PathVariable UUID id) {
        return service.approve(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
