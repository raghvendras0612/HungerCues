from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.dependencies.auth import get_current_firebase_uid
from app.models.baby import Baby
from app.models.feeding import Feeding
from app.models.sleep import SleepSession
from app.services.ai.service import AIService
from app.services.ai.schemas import AIInsightRequest, AIInsightResponse, FeedingLogInput, SleepLogInput, AIQuestionRequest, AIQuestionResponse

router = APIRouter()
ai_service = AIService()


@router.post("/insights/{baby_id}", response_model=AIInsightResponse)
async def get_insights(
    baby_id: int,
    db: AsyncSession = Depends(get_db),
    firebase_uid: str = Depends(get_current_firebase_uid),
):
    """Retrieve parenting insights for a specific baby by analyzing their feeding and sleep logs."""
    # 1. Fetch baby details
    stmt = select(Baby).where(Baby.id == baby_id)
    result = await db.execute(stmt)
    baby = result.scalar_one_or_none()
    if not baby:
        raise HTTPException(status_code=404, detail="Baby not found")

    # 2. Fetch feeding logs (limit to last 20 for prompt size)
    feeding_stmt = select(Feeding).where(Feeding.baby_id == baby_id).order_by(Feeding.start_time.desc()).limit(20)
    feedings_result = await db.execute(feeding_stmt)
    feedings = feedings_result.scalars().all()

    # 3. Fetch sleep logs (limit to last 20)
    sleep_stmt = select(SleepSession).where(SleepSession.baby_id == baby_id).order_by(SleepSession.sleep_start.desc()).limit(20)
    sleep_result = await db.execute(sleep_stmt)
    sleep_sessions = sleep_result.scalars().all()

    # 4. Construct AIInsightRequest
    req = AIInsightRequest(
        baby_name=baby.name,
        birth_date=baby.birth_date.isoformat(),
        gender=baby.gender,
        feedings=[
            FeedingLogInput(
                type=f.type,
                start_time=f.start_time,
                duration_minutes=f.duration_minutes,
                quantity_ml=f.quantity_ml,
                notes=f.notes,
            )
            for f in feedings
        ],
        sleep_sessions=[
            SleepLogInput(
                sleep_start=s.sleep_start,
                sleep_end=s.sleep_end,
                duration_minutes=s.duration_minutes,
                tracking_method=s.tracking_method,
                notes=s.notes,
            )
            for s in sleep_sessions
        ],
    )

    # 5. Call AI Service
    return await ai_service.get_parenting_insights(req)


@router.post("/ask/{baby_id}", response_model=AIQuestionResponse)
async def ask_question(
    baby_id: int,
    question_in: AIQuestionRequest,
    db: AsyncSession = Depends(get_db),
    firebase_uid: str = Depends(get_current_firebase_uid),
):
    """Ask a parenting question in the context of a baby's recent activity logs."""
    # 1. Fetch baby details
    stmt = select(Baby).where(Baby.id == baby_id)
    result = await db.execute(stmt)
    baby = result.scalar_one_or_none()
    if not baby:
        raise HTTPException(status_code=404, detail="Baby not found")

    # 2. Fetch feeding logs (limit to last 20 for prompt size)
    feeding_stmt = select(Feeding).where(Feeding.baby_id == baby_id).order_by(Feeding.start_time.desc()).limit(20)
    feedings_result = await db.execute(feeding_stmt)
    feedings = feedings_result.scalars().all()

    # 3. Fetch sleep logs (limit to last 20)
    sleep_stmt = select(SleepSession).where(SleepSession.baby_id == baby_id).order_by(SleepSession.sleep_start.desc()).limit(20)
    sleep_result = await db.execute(sleep_stmt)
    sleep_sessions = sleep_result.scalars().all()

    # 4. Construct AIInsightRequest
    req = AIInsightRequest(
        baby_name=baby.name,
        birth_date=baby.birth_date.isoformat(),
        gender=baby.gender,
        feedings=[
            FeedingLogInput(
                type=f.type,
                start_time=f.start_time,
                duration_minutes=f.duration_minutes,
                quantity_ml=f.quantity_ml,
                notes=f.notes,
            )
            for f in feedings
        ],
        sleep_sessions=[
            SleepLogInput(
                sleep_start=s.sleep_start,
                sleep_end=s.sleep_end,
                duration_minutes=s.duration_minutes,
                tracking_method=s.tracking_method,
                notes=s.notes,
            )
            for s in sleep_sessions
        ],
    )

    # 5. Call AI Service
    answer = await ai_service.ask_baby_question(req, question_in.question)
    return AIQuestionResponse(answer=answer)
