package com.scm.domain.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("""
        SELECT o FROM Order o
        WHERE (:status IS NULL OR o.status = :status)
          AND (:search IS NULL OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(o.customerName) LIKE LOWER(CONCAT('%',:search,'%')))
          AND (:from IS NULL OR o.orderedAt >= :from)
          AND (:to   IS NULL OR o.orderedAt <= :to)
        """)
    Page<Order> search(@Param("status") Order.OrderStatus status,
                       @Param("search") String search,
                       @Param("from")   Instant from,
                       @Param("to")     Instant to,
                       Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") Order.OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount),0) FROM Order o WHERE o.orderedAt >= :since")
    BigDecimal revenueS(@Param("since") Instant since);
}
