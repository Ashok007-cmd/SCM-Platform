package com.scm.domain.supplier;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierService {

    private final SupplierRepository repo;

    @Cacheable(value = "suppliers", key = "#id")
    public Supplier findById(UUID id) {
        return repo.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Supplier not found: " + id));
    }

    public Page<Supplier> search(Supplier.SupplierStatus status,
                                  Supplier.RiskLevel riskLevel,
                                  String search,
                                  Pageable pageable) {
        return repo.search(status, riskLevel, search, pageable);
    }

    @Transactional
    @CacheEvict(value = "suppliers", allEntries = true)
    public Supplier create(Supplier supplier) {
        if (repo.findByCode(supplier.getCode()).isPresent()) {
            throw new IllegalArgumentException("Supplier code already exists: " + supplier.getCode());
        }
        return repo.save(supplier);
    }

    @Transactional
    @CacheEvict(value = "suppliers", key = "#id")
    public Supplier update(UUID id, Supplier patch) {
        Supplier existing = findById(id);
        existing.setName(patch.getName());
        existing.setCountry(patch.getCountry());
        existing.setContactEmail(patch.getContactEmail());
        existing.setContactPhone(patch.getContactPhone());
        existing.setRiskLevel(patch.getRiskLevel());
        existing.setStatus(patch.getStatus());
        existing.setOnTimeRate(patch.getOnTimeRate());
        existing.setQualityScore(patch.getQualityScore());
        return repo.save(existing);
    }

    @Transactional
    @CacheEvict(value = "suppliers", key = "#id")
    public void delete(UUID id) {
        repo.delete(findById(id));
    }

    @Transactional
    @CacheEvict(value = "suppliers", key = "#id")
    public Supplier approve(UUID id) {
        Supplier supplier = findById(id);
        supplier.setStatus(Supplier.SupplierStatus.ACTIVE);
        return repo.save(supplier);
    }

    public Map<String, Long> getStats() {
        return Map.of(
            "total",        repo.count(),
            "active",       repo.countByStatus(Supplier.SupplierStatus.ACTIVE),
            "highRisk",     repo.countByRiskLevel(Supplier.RiskLevel.HIGH),
            "criticalRisk", repo.countByRiskLevel(Supplier.RiskLevel.CRITICAL)
        );
    }
}
