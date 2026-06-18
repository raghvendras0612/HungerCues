import json
import logging
from app.services.ai.client import GeminiClient
from app.services.ai.schemas import AIInsightRequest, AIInsightResponse

logger = logging.getLogger(__name__)


class AIService:
    """Service class for orchestrating calls to Gemini to get parenting advice."""

    def __init__(self):
        self.client = GeminiClient()

    async def get_parenting_insights(self, request: AIInsightRequest) -> AIInsightResponse:
        """Construct prompt, call Gemini, and parse response into AIInsightResponse."""
        system_instruction = (
            "You are a helpful, professional, and empathetic pediatric nurse and parenting assistant. "
            "Your goal is to analyze baby log data (feeding and sleep logs) and provide actionable, friendly, "
            "and scientifically grounded advice. You must return your response strictly as a JSON object matching "
            "the requested schema structure. Do not include markdown code fence formatting in the raw text response; "
            "output only valid raw JSON."
        )

        # Build log summaries
        feeding_text = ""
        for i, f in enumerate(request.feedings):
            qty = f"{f.quantity_ml}ml" if f.quantity_ml else "N/A"
            feeding_text += f"- Feeding #{i+1}: Type={f.type}, Start={f.start_time.isoformat()}, Duration={f.duration_minutes}m, Qty={qty}, Notes='{f.notes or ''}'\n"

        sleep_text = ""
        for i, s in enumerate(request.sleep_sessions):
            end_time = s.sleep_end.isoformat() if s.sleep_end else "Ongoing"
            dur = f"{s.duration_minutes}m" if s.duration_minutes else "N/A"
            sleep_text += f"- Sleep #{i+1}: Start={s.sleep_start.isoformat()}, End={end_time}, Duration={dur}, Method={s.tracking_method}, Notes='{s.notes or ''}'\n"

        prompt = (
            f"Please analyze the following details for baby '{request.baby_name}' "
            f"({request.gender}, born on {request.birth_date}):\n\n"
            f"--- FEEDING LOGS ---\n{feeding_text if feeding_text else 'No feedings recorded.'}\n\n"
            f"--- SLEEP LOGS ---\n{sleep_text if sleep_text else 'No sleep sessions recorded.'}\n\n"
            f"Please output a JSON object with the following fields:\n"
            f"1. 'summary': A friendly, personalized 2-3 sentence overview of the baby's logs.\n"
            f"2. 'feeding_insights': Brief analysis of feeding frequency, quantity, and types.\n"
            f"3. 'sleep_insights': Brief analysis of sleep times, durations, and sleep consistency.\n"
            f"4. 'recommendations': A list of 3 actionable, friendly parenting tips or recommendations.\n"
        )

        try:
            raw_response = await self.client.generate_content(prompt, system_instruction)
            
            # Clean up potential markdown fences if present
            cleaned_response = raw_response.strip()
            if cleaned_response.startswith("```"):
                # strip out markdown blocks
                lines = cleaned_response.splitlines()
                if lines[0].startswith("```json") or lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned_response = "\n".join(lines).strip()

            data = json.loads(cleaned_response)
            return AIInsightResponse(**data)
        except Exception as e:
            logger.error(f"Error parsing Gemini response or getting insights: {e}", exc_info=True)
            # Return a graceful fallback if anything fails
            return AIInsightResponse(
                summary=f"We processed the logs for {request.baby_name}. They are doing great! Let's continue tracking to find deeper patterns.",
                feeding_insights="Feedings appear to be occurring. Monitor spacing to ensure baby is feeding on demand or following a regular routing.",
                sleep_insights="Ensure baby has a quiet, dark sleep environment to encourage longer sleep cycles.",
                recommendations=[
                    "Maintain the feeding schedule you've started.",
                    "Track sleep using the live sleep timer to get exact nap durations.",
                    "Consult your pediatrician if you notice any sudden changes in feeding/sleeping patterns."
                ]
            )
