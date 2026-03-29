package com.scm.domain.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
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

    @Transactional
    public InventoryItem reserveQuantity(UUID id, int quantity) {
        InventoryItem item = findById(id);
        if (item.getQuantityAvailable() < quantity)
            throw new IllegalArgumentException("Insufficient available stock");
        item.setQuantityReserved(item.getQuantityReserved() + quantity);
        return repo.save(item);
    }

    public List<Map<String, Object>> getInventoryFlow(int days) {
        List<Map<String, Object>> flow = new ArrayList<>();
        Instant start = Instant.now().minus(days, ChronoUnit.DAYS);
        for (int i = 0; i < days; i++) {
            Instant from = start.plus(i, ChronoUnit.DAYS);
            LocalDate day = from.atZone(ZoneOffset.UTC).toLocalDate();
            flow.add(Map.of("date", day.toString(), "in", 0, "out", 0));
        }
        return flow;
    }

    public List<Map<String, Object>> getTopProducts(int limit) {
        return repo.findTopByValue(limit);
    }
}
