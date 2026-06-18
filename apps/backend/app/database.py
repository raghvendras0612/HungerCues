import logging
from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

logger = logging.getLogger(__name__)

# Default engine and sessionmaker
engine = create_async_engine(
    settings.database_url,
    echo=settings.environment == "development",
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides an async database session."""
    # Use dynamic sessionmaker in case it was re-created during startup
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def verify_and_setup_db() -> None:
    """Verify the database connection. Fallback to SQLite if Postgres is unavailable."""
    global engine, async_session
    sqlite_fallback = False

    if "postgresql" in settings.database_url:
        try:
            logger.info("Attempting to connect to PostgreSQL...")
            # Create a temporary connection to verify
            temp_engine = create_async_engine(
                settings.database_url,
                connect_args={"timeout": 3},  # short timeout for quick fallback
            )
            async with temp_engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            await temp_engine.dispose()
            logger.info("PostgreSQL connection verified successfully.")
        except Exception as e:
            logger.warning(
                f"PostgreSQL connection failed: {e}. Falling back to SQLite..."
            )
            sqlite_fallback = True

    if sqlite_fallback or "sqlite" in settings.database_url:
        fallback_url = "sqlite+aiosqlite:///./baby_tracker.db"
        engine = create_async_engine(
            fallback_url,
            connect_args={"check_same_thread": False},
            echo=settings.environment == "development",
        )
        async_session = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
        logger.info(f"Database engine set to SQLite: {fallback_url}")

    # Auto-create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized (tables created).")

