from datetime import datetime, date, time, timedelta
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from calendar import monthrange
from dateutil.relativedelta import relativedelta
from babel.dates import format_date
import locale

from ..models.models import User, TimeSession, Absence

def time_to_seconds(t: time) -> int:
    return t.hour * 3600 + t.minute * 60 + t.second

def format_duration(seconds: int) -> str:
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    return "{:02d}:{:02d}:{:02d}".format(hours, minutes, secs)

def calculate_count_time(user: User, db: Session) -> int:
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    sessions = db.query(TimeSession).filter(
        TimeSession.user_id == user.id,
        TimeSession.start_time >= start_of_day,
        TimeSession.start_time <= end_of_day
    ).order_by(TimeSession.start_time.asc()).all()

    total_seconds = 0
    for session in sessions:
        if session.elapsed_time is not None:
            total_seconds += time_to_seconds(session.elapsed_time)
        elif session.end_time is None:
            duration = datetime.now() - session.start_time
            total_seconds += int(duration.total_seconds())
    return total_seconds

def get_current_session(user: User, db: Session) -> Dict[str, Any]:
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    sessions = db.query(TimeSession).filter(
        TimeSession.user_id == user.id,
        TimeSession.start_time >= start_of_day,
        TimeSession.start_time <= end_of_day
    ).order_by(TimeSession.start_time.asc()).all()
    
    if not sessions:
        return {
            "start_time": None,
            "end_time": None,
            "elapsed_time": "00:00:00",
            "count_time": 0,
            "is_active": False
        }

    time_formatter = "%H:%M:%S"
    total_seconds = 0
    is_active = False

    for session in sessions:
        if session.end_time is not None and session.elapsed_time is not None:
            total_seconds += time_to_seconds(session.elapsed_time)
        elif session.end_time is None:
            duration = datetime.now() - session.start_time
            total_seconds += int(duration.total_seconds())
            is_active = True

    latest_session = sessions[-1]
    
    return {
        "start_time": sessions[0].start_time.strftime(time_formatter),
        "end_time": latest_session.end_time.strftime(time_formatter) if latest_session.end_time else None,
        "elapsed_time": format_duration(total_seconds),
        "count_time": total_seconds,
        "is_active": is_active
    }

def start_new_session(user: User, db: Session) -> Dict[str, Any]:
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    active_session = db.query(TimeSession).filter(
        TimeSession.user_id == user.id,
        TimeSession.end_time == None
    ).first()

    if active_session:
        raise ValueError("Sesja jest już aktywna.")

    existing_session = db.query(TimeSession).filter(
        TimeSession.user_id == user.id,
        TimeSession.start_time >= start_of_day,
        TimeSession.start_time <= end_of_day
    ).order_by(TimeSession.start_time.asc()).first()

    new_session = TimeSession(
        user_id=user.id,
        start_time=datetime.now(),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    time_formatter = "%H:%M:%S"
    start_time = existing_session.start_time.strftime(time_formatter) if existing_session else new_session.start_time.strftime(time_formatter)
    count_time = calculate_count_time(user, db)

    return {
        "start_time": start_time,
        "count_time": count_time,
        "is_active": True
    }

def stop_session(user: User, db: Session) -> Dict[str, Any]:
    active_session = db.query(TimeSession).filter(
        TimeSession.user_id == user.id,
        TimeSession.end_time == None
    ).order_by(TimeSession.start_time.desc()).first()

    if not active_session:
        raise ValueError("Nie znaleziono aktywnej sesji")

    end_time = datetime.now()
    duration = end_time - active_session.start_time
    
    active_session.end_time = end_time
    active_session.elapsed_time = (datetime.min + duration).time()
    active_session.updated_at = datetime.now()
    
    db.commit()
    db.refresh(active_session)

    full_elapsed_seconds = calculate_count_time(user, db)
    active_session.full_elapsed_time = (datetime.min + timedelta(seconds=full_elapsed_seconds)).time()

    db.commit()
    db.refresh(active_session)

    time_formatter = "%H:%M:%S"
    return {
        "end_time": active_session.end_time.strftime(time_formatter),
        "elapsed_time": format_duration(full_elapsed_seconds)
    }
