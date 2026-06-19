from datetime import datetime
from pydantic import BaseModel, Field


class FeedingLogInput(BaseModel):
    type: str  # breast, bottle, pumping
    start_time: datetime
    duration_minutes: int
    quantity_ml: float | None = None
    notes: str | None = None


class SleepLogInput(BaseModel):
    sleep_start: datetime
    sleep_end: datetime | None = None
    duration_minutes: int | None = None
    tracking_method: str
    notes: str | None = None


class AIInsightRequest(BaseModel):
    baby_name: str
    birth_date: str
    gender: str
    feedings: list[FeedingLogInput] = []
    sleep_sessions: list[SleepLogInput] = []


class AIInsightResponse(BaseModel):
    summary: str = Field(description="A friendly, personalized 2-3 sentence overview of the baby's status.")
    feeding_insights: str = Field(description="Analysis of feeding logs, patterns, or gaps.")
    sleep_insights: str = Field(description="Analysis of sleeping cycles, duration, and patterns.")
    recommendations: list[str] = Field(description="List of 3 actionable parenting recommendations based on the logs.")


class AIQuestionRequest(BaseModel):
    question: str


class AIQuestionResponse(BaseModel):
    answer: str
