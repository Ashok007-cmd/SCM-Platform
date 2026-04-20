package com.scm.domain.inventory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
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

    @Query(value = """
        SELECT p.sku AS sku, p.name AS name,
               SUM(i.quantity_on_hand * p.unit_cost) AS value
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        GROUP BY p.sku, p.name
        ORDER BY value DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Map<String, Object>> findTopByValue(@Param("limit") int limit);
    public interface InventoryFlowData {
        java.sql.Date getDate();
        Long getInQuantity();
        Long getOutQuantity();
    }

    @Query(value = """
        SELECT date, SUM(in_qty) as inQuantity, SUM(out_qty) as outQuantity
        FROM (
          SELECT CAST(po.received_date AS DATE) as date, SUM(poi.quantity_received) as in_qty, 0 as out_qty
          FROM purchase_orders po
          JOIN po_items poi ON po.id = poi.po_id
          WHERE po.received_date >= :since
          GROUP BY date
          UNION ALL
          SELECT CAST(s.shipped_at AS DATE) as date, 0 as in_qty, SUM(oi.quantity) as out_qty
          FROM shipments s
          JOIN order_items oi ON s.order_id = oi.order_id
          WHERE s.shipped_at >= :since
          GROUP BY date
        ) t
        GROUP BY date ORDER BY date
        """, nativeQuery = true)
    List<InventoryFlowData> getInventoryFlowData(@Param("since") Instant since);
}
