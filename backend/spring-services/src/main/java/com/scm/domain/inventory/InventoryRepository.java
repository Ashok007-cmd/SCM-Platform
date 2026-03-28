package com.scm.domain.inventory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, UUID> {

    @Query("""
        SELECT i FROM InventoryItem i JOIN i.product p
        WHERE (:sku IS NULL OR LOWER(p.sku) LIKE LOWER(CONCAT('%',:sku,'%')))
          AND (:category IS NULL OR p.category = :category)
          AND (:status IS NULL
               OR (:status = 'LOW_STOCK'  AND (i.quantityOnHand - i.quantityReserved) > 0
                                          AND (i.quantityOnHand - i.quantityReserved) <= p.reorderPoint)
               OR (:status = 'OUT_OF_STOCK' AND (i.quantityOnHand - i.quantityReserved) <= 0)
               OR (:status = 'IN_STOCK'    AND (i.quantityOnHand - i.quantityReserved) > p.reorderPoint))
        """)
    Page<InventoryItem> search(@Param("sku")      String sku,
                               @Param("category") String category,
                               @Param("status")   String status,
                               Pageable pageable);

    @Query("SELECT i FROM InventoryItem i WHERE (i.quantityOnHand - i.quantityReserved) <= i.product.reorderPoint AND i.product.reorderPoint > 0")
    List<InventoryItem> findLowStock();

    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE (i.quantityOnHand - i.quantityReserved) <= 0")
    long countOutOfStock();

    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE (i.quantityOnHand - i.quantityReserved) <= i.product.reorderPoint AND i.product.reorderPoint > 0")
    long countLowStock();

    @Query("SELECT COALESCE(SUM(i.quantityOnHand * i.product.unitCost), 0) FROM InventoryItem i")
    BigDecimal totalInventoryValue();
}
