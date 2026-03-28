package com.scm.domain.inventory;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inventory", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id","warehouse_id"}))
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "warehouse_id")
    private UUID warehouseId;

    @Column(name = "quantity_on_hand")
    private Integer quantityOnHand = 0;

    @Column(name = "quantity_reserved")
    private Integer quantityReserved = 0;

    @Column(name = "last_counted_at")
    private Instant lastCountedAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public int getQuantityAvailable() {
        return quantityOnHand - quantityReserved;
    }

    public boolean isBelowReorderPoint() {
        return product.getReorderPoint() != null
            && getQuantityAvailable() < product.getReorderPoint();
    }
}
