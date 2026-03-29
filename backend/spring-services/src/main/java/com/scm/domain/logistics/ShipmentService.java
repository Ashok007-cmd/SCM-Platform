package com.scm.domain.logistics;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShipmentService {

    private final ShipmentRepository repo;

    public Page<Shipment> search(Shipment.ShipmentStatus status, String carrier, Pageable pageable) {
        return repo.search(status, carrier, pageable);
    }

    public Shipment findById(UUID id) {
        return repo.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Shipment not found: " + id));
    }

    public Shipment findByTrackingNumber(String trackingNumber) {
        return repo.findByTrackingNumber(trackingNumber)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Shipment not found: " + trackingNumber));
    }

    public List<Shipment> getDelayed() {
        return repo.findDelayed();
    }

    @Transactional
    public Shipment create(Shipment shipment) {
        return repo.save(shipment);
    }

    @Transactional
    public Shipment markDelivered(UUID id) {
        Shipment shipment = findById(id);
        shipment.setStatus(Shipment.ShipmentStatus.DELIVERED);
        shipment.setDeliveredAt(Instant.now());
        return repo.save(shipment);
    }

    public Map<String, Object> getStats() {
        return Map.of(
            "total",          repo.count(),
            "inTransit",      repo.countByStatus(Shipment.ShipmentStatus.IN_TRANSIT),
            "outForDelivery", repo.countByStatus(Shipment.ShipmentStatus.OUT_FOR_DELIVERY),
            "delivered",      repo.countByStatus(Shipment.ShipmentStatus.DELIVERED),
            "delayed",        repo.countByStatus(Shipment.ShipmentStatus.DELAYED),
            "lost",           repo.countByStatus(Shipment.ShipmentStatus.LOST)
        );
    }
}
