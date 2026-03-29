"""Route optimisation router — carrier selection & ETD estimation."""
from datetime import datetime, timedelta
from typing import List, Optional
import numpy as np
from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter()

CARRIERS = ["FedEx", "DHL", "UPS", "Maersk", "DB Schenker"]

class RouteRequest(BaseModel):
    origin: str
    destination: str
    weight_kg: float = 10.0
    volume_cbm: float = 0.05
    priority: str = "STANDARD"   # STANDARD | EXPRESS | ECONOMY

class RouteOption(BaseModel):
    carrier: str
    mode: str
    estimated_days: int
    cost_usd: float
    co2_kg: float
    recommended: bool

@router.post("/route-options")
async def get_route_options(req: RouteRequest) -> List[RouteOption]:
    np.random.seed(hash(f"{req.origin}{req.destination}") % (2**31))
    options = []
    modes = ["Air", "Sea", "Road", "Rail"]
    for i, carrier in enumerate(CARRIERS[:3]):
        mode = modes[i % len(modes)]
        base_days = {"Air": 3, "Sea": 21, "Road": 7, "Rail": 14}[mode]
        days = base_days + int(np.random.randint(-1, 3))
        cost = req.weight_kg * ({"Air": 8.5, "Sea": 0.9, "Road": 3.2, "Rail": 1.8}[mode])
        cost += float(np.random.uniform(-cost*0.1, cost*0.1))
        co2 = req.weight_kg * ({"Air": 0.602, "Sea": 0.016, "Road": 0.096, "Rail": 0.028}[mode])
        options.append(RouteOption(
            carrier=carrier, mode=mode,
            estimated_days=max(1, days),
            cost_usd=round(cost, 2),
            co2_kg=round(co2, 3),
            recommended=(i == 0),
        ))
    # Sort by priority preference
    if req.priority == "EXPRESS":
        options.sort(key=lambda x: x.estimated_days)
    elif req.priority == "ECONOMY":
        options.sort(key=lambda x: x.cost_usd)
    else:
        options.sort(key=lambda x: (x.cost_usd + x.estimated_days * 10))
    options[0].recommended = True
    return options

@router.get("/shipment/{shipment_id}/eta")
async def estimate_eta(shipment_id: str, carrier: Optional[str] = None):
    np.random.seed(hash(shipment_id) % (2**31))
    base_eta = datetime.utcnow() + timedelta(days=int(np.random.randint(3, 21)))
    delay_probability = float(np.random.uniform(0.0, 0.25))
    return {
        "shipment_id":       shipment_id,
        "carrier":           carrier or CARRIERS[int(np.random.randint(0, len(CARRIERS)))],
        "estimated_arrival": base_eta.strftime("%Y-%m-%d"),
        "delay_probability": round(delay_probability, 3),
        "delay_alert":       delay_probability > 0.15,
        "calculated_at":     datetime.utcnow().isoformat(),
    }
