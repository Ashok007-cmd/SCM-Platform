package com.scm.domain.logistics;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "shipments")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Shipment {

    public enum ShipmentStatus {
        PENDING, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, DELAYED, LOST
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tracking_number", unique = true, nullable = false)
    private String trackingNumber;

    @Column(name = "order_id")
    private UUID orderId;

    @Column(nullable = false)
    private String carrier;

    @Column(name = "service_type")
    private String serviceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status = ShipmentStatus.PENDING;

    @Column(name = "origin_address", nullable = false)
    private String originAddress;

    @Column(name = "dest_address", nullable = false)
    private String destAddress;

    @Column(name = "shipped_at")
    private Instant shippedAt;

    @Column(name = "estimated_at")
    private Instant estimatedAt;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "weight_kg", precision = 10, scale = 3)
    private BigDecimal weightKg;

    @Column(name = "freight_cost", precision = 14, scale = 2)
    private BigDecimal freightCost;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
