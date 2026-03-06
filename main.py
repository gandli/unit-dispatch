from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Unit Dispatch Backend", description="智能派车系统后端API")

class Vehicle(BaseModel):
    id: str
    type: str  # "unit" or "didi"
    status: str  # "available", "busy", "maintenance"
    location: str
    priority: int  # unit vehicles have higher priority

class DispatchRequest(BaseModel):
    origin: str
    destination: str
    urgency: str  # "normal", "urgent"
    passenger_count: int

class DispatchResponse(BaseModel):
    vehicle_id: str
    vehicle_type: str
    estimated_arrival: str
    cost: float
    audit_log: str

@app.get("/")
async def root():
    return {"message": "Unit Dispatch Backend - 智能派车系统"}

@app.get("/vehicles")
async def get_vehicles() -> List[Vehicle]:
    # Mock data for now
    return [
        Vehicle(id="U001", type="unit", status="available", location="总部", priority=10),
        Vehicle(id="U002", type="unit", status="available", location="分部", priority=10),
        Vehicle(id="D001", type="didi", status="available", location="附近", priority=1),
    ]

@app.post("/dispatch")
async def dispatch_vehicle(request: DispatchRequest) -> DispatchResponse:
    # TODO: Implement intelligent dispatch logic
    # Priority: unit vehicles first, then didi as backup
    return DispatchResponse(
        vehicle_id="U001",
        vehicle_type="unit",
        estimated_arrival="10分钟",
        cost=0.0,
        audit_log="单位车辆优先派单 - 合规审计记录"
    )