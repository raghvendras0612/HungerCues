"""
API v1 router.

All versioned endpoints are mounted here under /api/v1/*.

Future routes:
    /api/v1/auth
    /api/v1/families
    /api/v1/babies
    /api/v1/feedings
    /api/v1/sleep
"""

from fastapi import APIRouter

router = APIRouter()

# Mount feature routers here as they are implemented:
# router.include_router(auth_router, prefix="/auth", tags=["auth"])
# router.include_router(families_router, prefix="/families", tags=["families"])
# router.include_router(babies_router, prefix="/babies", tags=["babies"])
# router.include_router(feedings_router, prefix="/feedings", tags=["feedings"])
# router.include_router(sleep_router, prefix="/sleep", tags=["sleep"])
