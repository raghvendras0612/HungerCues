import pytest
from datetime import date, datetime, timedelta
from unittest.mock import MagicMock

from app.jobs.notification_scheduler import is_active_hours

def test_is_active_hours_under_four_months():
    # 2 months old baby
    birth_date = date.today() - timedelta(days=60)
    # Under 4 months (60 / 30.4 = 1.97 months) should always return True regardless of hour
    assert is_active_hours(birth_date) is True

def test_is_active_hours_over_four_months():
    # 6 months old baby
    birth_date = date.today() - timedelta(days=183)
    # Calculate what is expected for the current hour
    current_hour = datetime.now().hour
    expected = 8 <= current_hour < 24
    assert is_active_hours(birth_date) == expected
