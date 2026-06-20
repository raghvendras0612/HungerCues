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
    await db_module.verify_and_setup_db()
    async with db_module.engine.begin() as conn:
        await conn.run_sync(db_module.Base.metadata.create_all)
    yield
    async with db_module.engine.begin() as conn:
        await conn.run_sync(db_module.Base.metadata.drop_all)

@pytest_asyncio.fixture
async def db_session():
    async for session in db_module.get_db():
        yield session

@pytest.mark.asyncio
async def test_feeding_breast_side(db_session):
    # 1. Create a dummy baby in the database
    baby = Baby(
        name="Feeding Baby",
        birth_date=datetime(2026, 1, 1).date(),
        gender="Girl",
        family_id="mock-user-uid"
    )
    db_session.add(baby)
    await db_session.commit()
    await db_session.refresh(baby)

    # 2. Test create feeding record with breast_side
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        now_str = datetime.now(UTC).isoformat().replace("+00:00", "Z")
        response = await client.post(
            "/api/v1/feedings/",
            json={
                "baby_id": baby.id,
                "type": "breast",
                "start_time": now_str,
                "duration_minutes": 15,
                "breast_side": "Left",
                "notes": "Good feeding"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "breast"
        assert data["duration_minutes"] == 15
        assert data["breast_side"] == "Left"
        assert data["notes"] == "Good feeding"
        
        # 3. Test list feedings
        list_response = await client.get(f"/api/v1/feedings/baby/{baby.id}")
        assert list_response.status_code == 200
        feedings = list_response.json()
        assert len(feedings) == 1
        assert feedings[0]["breast_side"] == "Left"
