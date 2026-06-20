from datetime import datetime, UTC
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
import app.database as db_module
from app.dependencies.auth import get_current_firebase_uid
from app.models.baby import Baby

# Override firebase auth for tests
async def override_get_current_firebase_uid():
    return "mock-user-uid"

app.dependency_overrides[get_current_firebase_uid] = override_get_current_firebase_uid

@pytest_asyncio.fixture(scope="module", autouse=True)
async def setup_db():
    # Call verify_and_setup_db to trigger PostgreSQL connection check & SQLite fallback
    await db_module.verify_and_setup_db()
    # Create tables in the engine (which may have fallen back to SQLite)
    async with db_module.engine.begin() as conn:
        await conn.run_sync(db_module.Base.metadata.create_all)
    yield
    # Cleanup tables
    async with db_module.engine.begin() as conn:
        await conn.run_sync(db_module.Base.metadata.drop_all)

@pytest_asyncio.fixture
async def db_session():
    async for session in db_module.get_db():
        yield session

@pytest.mark.asyncio
async def test_growth_endpoints(db_session):
    # 1. Create a dummy baby in the database first
    baby = Baby(
        name="Charlie Test",
        birth_date=datetime(2026, 1, 1).date(),
        gender="Boy",
        family_id="mock-user-uid"
    )
    db_session.add(baby)
    await db_session.commit()
    await db_session.refresh(baby)
    
    # 2. Test create growth record
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create valid record
        now_str = datetime.now(UTC).isoformat().replace("+00:00", "Z")
        response = await client.post(
            "/api/v1/growth/",
            json={
                "baby_id": baby.id,
                "recorded_at": now_str,
                "weight_kg": 5.4,
                "height_cm": 58.2,
                "notes": "Healthy progress"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["weight_kg"] == 5.4
        assert data["height_cm"] == 58.2
        assert data["notes"] == "Healthy progress"
        record_id = data["id"]
        
        # Test validation: missing both height and weight
        response_invalid = await client.post(
            "/api/v1/growth/",
            json={
                "baby_id": baby.id,
                "recorded_at": now_str,
                "notes": "No metrics"
            }
        )
        assert response_invalid.status_code == 400
        
        # Test validation: negative values
        response_neg = await client.post(
            "/api/v1/growth/",
            json={
                "baby_id": baby.id,
                "recorded_at": now_str,
                "weight_kg": -2.0,
                "height_cm": 50.0
            }
        )
        assert response_neg.status_code == 422 # Pydantic validation error

        # 3. Test list growth records
        list_response = await client.get(f"/api/v1/growth/baby/{baby.id}")
        assert list_response.status_code == 200
        records = list_response.json()
        assert len(records) >= 1
        assert records[0]["id"] == record_id
        
        # Test non-existent baby
        list_response_404 = await client.get("/api/v1/growth/baby/99999")
        assert list_response_404.status_code == 404
