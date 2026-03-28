package com.scm.domain.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final InventoryRepository repo;

    public Page<InventoryItem> search(String sku, String category, String status, Pageable pageable) {
        return repo.search(sku, category, status, pageable);
    }

    public InventoryItem findById(UUID id) {
        return repo.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Inventory item not found: " + id));
    }

    @Cacheable("inventory-stats")
    public Map<String, Object> getStats() {
        BigDecimal totalValue = repo.totalInventoryValue();
        return Map.of(
            "totalSkus",     repo.count(),
            "totalValue",    totalValue != null ? totalValue : BigDecimal.ZERO,
            "lowStock",      repo.countLowStock(),
            "outOfStock",    repo.countOutOfStock()
        );
    }

    public List<InventoryItem> getLowStock() {
        return repo.findLowStock();
    }

    @Transactional
    public InventoryItem adjustQuantity(UUID id, int delta) {
        InventoryItem item = findById(id);
        int newQty = item.getQuantityOnHand() + delta;
        if (newQty < 0) throw new IllegalArgumentException("Quantity cannot be negative");
        item.setQuantityOnHand(newQty);
        return repo.save(item);
    }
}
