"""Supplier risk scoring router."""
from datetime import datetime
from typing import Optional
import numpy as np
from fastapi import APIRouter, Query

router = APIRouter()

class SupplierRiskScore:
    def __init__(self, supplier_id: str):
        np.random.seed(hash(supplier_id) % (2**31))
        self.on_time_rate       = float(np.random.uniform(0.60, 1.00))
        self.quality_defect_rate= float(np.random.uniform(0.00, 0.15))
        self.financial_stability= float(np.random.uniform(0.50, 1.00))
        self.geopolitical_risk  = float(np.random.uniform(0.00, 0.80))
        self.lead_time_variance = float(np.random.uniform(0.00, 0.50))

    def score(self) -> float:
        return (
            (1 - self.on_time_rate) * 30
            + self.quality_defect_rate * 25
            + (1 - self.financial_stability) * 20
            + self.geopolitical_risk * 15
            + self.lead_time_variance * 10
        )

    def level(self) -> str:
        s = self.score()
        return "LOW" if s < 30 else "MEDIUM" if s < 60 else "HIGH"


@router.get("/{supplier_id}/risk")
async def get_supplier_risk(supplier_id: str):
    r = SupplierRiskScore(supplier_id)
    return {
        "supplier_id":  supplier_id,
        "risk_score":   round(r.score(), 2),
        "risk_level":   r.level(),
        "factors": {
            "on_time_delivery_rate": round(r.on_time_rate, 3),
            "quality_defect_rate":   round(r.quality_defect_rate, 3),
            "financial_stability":   round(r.financial_stability, 3),
            "geopolitical_risk":     round(r.geopolitical_risk, 3),
            "lead_time_variance":    round(r.lead_time_variance, 3),
        },
        "assessed_at": datetime.utcnow().isoformat(),
    }


@router.get("/risk/summary")
async def risk_summary(limit: int = Query(10, ge=1, le=100)):
    """Return top N highest-risk suppliers (simulated)."""
    suppliers = [f"SUP-{str(i).zfill(3)}" for i in range(1, limit + 1)]
    results = []
    for sid in suppliers:
        r = SupplierRiskScore(sid)
        results.append({
            "supplier_id": sid,
            "risk_score":  round(r.score(), 2),
            "risk_level":  r.level(),
        })
    return sorted(results, key=lambda x: x["risk_score"], reverse=True)
