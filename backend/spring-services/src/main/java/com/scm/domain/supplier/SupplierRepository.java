package com.scm.domain.supplier;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    Optional<Supplier> findByCode(String code);

    Page<Supplier> findByStatus(Supplier.SupplierStatus status, Pageable pageable);

    Page<Supplier> findByRiskLevel(Supplier.RiskLevel riskLevel, Pageable pageable);

    @Query("""
        SELECT s FROM Supplier s
        WHERE (:status IS NULL OR s.status = :status)
          AND (:riskLevel IS NULL OR s.riskLevel = :riskLevel)
          AND (:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(s.code) LIKE LOWER(CONCAT('%',:search,'%')))
        """)
    Page<Supplier> search(
        @Param("status")    Supplier.SupplierStatus status,
        @Param("riskLevel") Supplier.RiskLevel riskLevel,
        @Param("search")    String search,
        Pageable pageable
    );

    @Query("SELECT COUNT(s) FROM Supplier s WHERE s.riskLevel = :level")
    long countByRiskLevel(@Param("level") Supplier.RiskLevel level);

    @Query("SELECT COUNT(s) FROM Supplier s WHERE s.status = :status")
    long countByStatus(@Param("status") Supplier.SupplierStatus status);
}
