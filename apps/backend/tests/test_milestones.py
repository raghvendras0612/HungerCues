from datetime import datetime, date
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
async def test_milestone_endpoints(db_session):
    # 1. Create a baby
    baby = Baby(
        name="Charlie Milestone Test",
        birth_date=datetime(2026, 1, 1).date(),
        gender="Boy",
        family_id="mock-user-uid"
    )
    db_session.add(baby)
    await db_session.commit()
    await db_session.refresh(baby)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 2. Test create milestone
        response = await client.post(
            "/api/v1/milestones/",
            json={
                "baby_id": baby.id,
                "name": "Social Smile",
                "achieved_at": "2026-03-01",
                "notes": "First big smile!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Social Smile"
        assert data["achieved_at"] == "2026-03-01"
        assert data["notes"] == "First big smile!"
        milestone_id = data["id"]

        # 3. Test list milestones
        list_response = await client.get(f"/api/v1/milestones/baby/{baby.id}")
        assert list_response.status_code == 200
        milestones = list_response.json()
        assert len(milestones) >= 1
        assert milestones[0]["id"] == milestone_id

        # 4. Test update milestone
        update_response = await client.patch(
            f"/api/v1/milestones/{milestone_id}",
            json={
                "notes": "Smiling all the time now!"
            }
        )
        assert update_response.status_code == 200
        updated_data = update_response.json()
        assert updated_data["notes"] == "Smiling all the time now!"

        # 5. Test delete milestone
        delete_response = await client.delete(f"/api/v1/milestones/{milestone_id}")
        assert delete_response.status_code == 200
        assert delete_response.json() == {"status": "deleted"}

        # 6. Verify deletion
        list_response_after = await client.get(f"/api/v1/milestones/baby/{baby.id}")
        assert list_response_after.status_code == 200
        assert len(list_response_after.json()) == 0
