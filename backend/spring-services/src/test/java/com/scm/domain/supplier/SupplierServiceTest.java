package com.scm.domain.supplier;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SupplierService Unit Tests")
class SupplierServiceTest {

    @Mock  SupplierRepository repo;
    @InjectMocks SupplierService service;

    private Supplier supplier;

    @BeforeEach
    void setUp() {
        supplier = Supplier.builder()
            .id(UUID.randomUUID())
            .name("Acme Corp")
            .code("ACME-001")
            .country("USA")
            .riskLevel(Supplier.RiskLevel.LOW)
            .status(Supplier.SupplierStatus.ACTIVE)
            .onTimeRate(new BigDecimal("0.97"))
            .qualityScore(new BigDecimal("4.5"))
            .build();
    }

    @Test
    @DisplayName("findById returns supplier when present")
    void findById_returnsSupplier() {
        when(repo.findById(supplier.getId())).thenReturn(Optional.of(supplier));
        Supplier result = service.findById(supplier.getId());
        assertThat(result.getCode()).isEqualTo("ACME-001");
    }

    @Test
    @DisplayName("findById throws when not found")
    void findById_throwsWhenNotFound() {
        UUID id = UUID.randomUUID();
        when(repo.findById(id)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.findById(id))
            .isInstanceOf(jakarta.persistence.EntityNotFoundException.class)
            .hasMessageContaining(id.toString());
    }

    @Test
    @DisplayName("create persists and returns supplier")
    void create_savesSupplier() {
        when(repo.findByCode("ACME-001")).thenReturn(Optional.empty());
        when(repo.save(supplier)).thenReturn(supplier);
        Supplier created = service.create(supplier);
        assertThat(created.getName()).isEqualTo("Acme Corp");
        verify(repo).save(supplier);
    }

    @Test
    @DisplayName("create throws on duplicate code")
    void create_throwsOnDuplicateCode() {
        when(repo.findByCode("ACME-001")).thenReturn(Optional.of(supplier));
        assertThatThrownBy(() -> service.create(supplier))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("ACME-001");
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("getStats returns expected keys")
    void getStats_returnsCorrectKeys() {
        when(repo.count()).thenReturn(42L);
        when(repo.countByStatus(Supplier.SupplierStatus.ACTIVE)).thenReturn(35L);
        when(repo.countByRiskLevel(Supplier.RiskLevel.HIGH)).thenReturn(5L);
        when(repo.countByRiskLevel(Supplier.RiskLevel.CRITICAL)).thenReturn(2L);
        Map<String, Long> stats = service.getStats();
        assertThat(stats).containsKeys("total","active","highRisk","criticalRisk");
        assertThat(stats.get("total")).isEqualTo(42L);
    }

    @Test
    @DisplayName("search delegates to repository with correct params")
    void search_delegatesToRepo() {
        var page = PageRequest.of(0, 10);
        var result = new PageImpl<>(List.of(supplier));
        when(repo.search(null, null, null, page)).thenReturn(result);
        var found = service.search(null, null, null, page);
        assertThat(found.getTotalElements()).isEqualTo(1);
    }
}
