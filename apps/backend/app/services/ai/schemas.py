"""
Pydantic models for AI service input/output payloads.

All data flowing to and from AI services (Gemma, or any future replacement)
must be validated through Pydantic models defined in this file.

This ensures:
- Strict input validation before sending to AI
- Structured output parsing from AI responses
- Type safety across the AI integration boundary
"""

# TODO: Define AI request/response schemas when AI features are implemented.
# Example:
#
# from pydantic import BaseModel
#
# class AIInsightRequest(BaseModel):
#     baby_id: str
#     data_type: str
#     context: dict
#
# class AIInsightResponse(BaseModel):
#     insight: str
#     confidence: float
