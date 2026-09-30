from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import AIGeneratePlanRequest, AIGeneratedPlan, AIInsightsResponse, AIAdjustResponse
from services import ai as svc

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/generate-plan", response_model=AIGeneratedPlan)
def generate_plan(data: AIGeneratePlanRequest):
    return svc.generate_plan(data)


@router.get("/insights", response_model=AIInsightsResponse)
def insights(db: Session = Depends(get_db)):
    return svc.generate_insights(db)


@router.post("/adjust-plan/{plan_id}", response_model=AIAdjustResponse)
def adjust_plan(plan_id: int, db: Session = Depends(get_db)):
    try:
        return svc.adjust_plan(db, plan_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
