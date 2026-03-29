package com.scm.domain.logistics;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    @Query("""
        SELECT s FROM Shipment s
        WHERE (:status IS NULL OR s.status = :status)
          AND (:carrier IS NULL OR LOWER(s.carrier) LIKE LOWER(CONCAT('%',:carrier,'%')))
        """)
    Page<Shipment> search(@Param("status")  Shipment.ShipmentStatus status,
                          @Param("carrier") String carrier,
                          Pageable pageable);

    @Query("""
        SELECT s FROM Shipment s
        WHERE s.status = com.scm.domain.logistics.Shipment.ShipmentStatus.DELAYED
           OR (s.estimatedAt < CURRENT_TIMESTAMP
               AND s.status NOT IN (
                   com.scm.domain.logistics.Shipment.ShipmentStatus.DELIVERED,
                   com.scm.domain.logistics.Shipment.ShipmentStatus.LOST))
        """)
    List<Shipment> findDelayed();

    long countByStatus(Shipment.ShipmentStatus status);
}
