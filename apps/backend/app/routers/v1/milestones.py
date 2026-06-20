from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.dependencies.auth import get_current_firebase_uid
from app.models.milestone import Milestone
from app.models.baby import Baby

router = APIRouter()


class MilestoneCreate(BaseModel):
    baby_id: int
    name: str
    achieved_at: date | None = None
    notes: str | None = None


class MilestoneUpdate(BaseModel):
    achieved_at: date | None = None
    notes: str | None = None


class MilestoneSchema(BaseModel):
    id: int
    baby_id: int
    name: str
    achieved_at: date | None
    notes: str | None

    class Config:
        from_attributes = True


@router.post("/", response_model=MilestoneSchema)
async def create_milestone(
    milestone_in: MilestoneCreate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_firebase_uid),
):
    # Check if baby exists
    baby_stmt = select(Baby).where(Baby.id == milestone_in.baby_id)
    baby_result = await db.execute(baby_stmt)
    baby = baby_result.scalar_one_or_none()
    if not baby:
        raise HTTPException(status_code=404, detail="Baby not found")

    milestone = Milestone(**milestone_in.model_dump())
    db.add(milestone)
    await db.commit()
    await db.refresh(milestone)
    return milestone


@router.get("/baby/{baby_id}", response_model=list[MilestoneSchema])
async def list_milestones(
    baby_id: int,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_firebase_uid),
):
    # Check if baby exists
    baby_stmt = select(Baby).where(Baby.id == baby_id)
    baby_result = await db.execute(baby_stmt)
    baby = baby_result.scalar_one_or_none()
    if not baby:
        raise HTTPException(status_code=404, detail="Baby not found")

    stmt = (
        select(Milestone)
        .where(Milestone.baby_id == baby_id)
        .order_by(Milestone.achieved_at.asc(), Milestone.name.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.patch("/{id}", response_model=MilestoneSchema)
async def update_milestone(
    id: int,
    milestone_in: MilestoneUpdate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_firebase_uid),
):
    stmt = select(Milestone).where(Milestone.id == id)
    result = await db.execute(stmt)
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    update_data = milestone_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(milestone, field, value)

    await db.commit()
    await db.refresh(milestone)
    return milestone


@router.delete("/{id}")
async def delete_milestone(
    id: int,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_firebase_uid),
):
    stmt = select(Milestone).where(Milestone.id == id)
    result = await db.execute(stmt)
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    await db.delete(milestone)
    await db.commit()
    return {"status": "deleted"}
