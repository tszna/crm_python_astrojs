from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from ..core.security import get_current_user
from ..db.database import get_db
from ..models.models import User, TimeSession
from ..schemas.schemas import CurrentSessionOut
from ..services.time_service import (
    get_current_session,
    start_new_session,
    stop_session,
    calculate_count_time,
    format_duration,
    time_to_seconds
)

router = APIRouter(prefix="/api/time")

@router.get("/getCurrentSession", response_model=CurrentSessionOut)
def get_current_session_route(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_current_session(current_user, db)

@router.post("/startSession")
def start_session_route(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return start_new_session(current_user, db)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/stopSession")
def stop_session_route(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return stop_session(current_user, db)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/weekly-summary")
def get_weekly_summary(
    weekOffset: int = 0,
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import date, datetime, timedelta

    if user_id is None:
        selected_user = current_user
    else:
        selected_user = db.query(User).filter(User.id == user_id).first()
        if selected_user is None:
            raise HTTPException(status_code=404, detail="Nie znaleziono użytkownika.")

    today = date.today()
    start_of_week = today + timedelta(weeks=weekOffset)
    start_of_week -= timedelta(days=start_of_week.weekday())  
    end_of_week = start_of_week + timedelta(days=6)  

    start_of_week_datetime = datetime.combine(start_of_week, datetime.min.time())
    end_of_week_datetime = datetime.combine(end_of_week, datetime.max.time())

    sessions = db.query(TimeSession).filter(
        TimeSession.user_id == selected_user.id,
        TimeSession.start_time >= start_of_week_datetime,
        TimeSession.start_time <= end_of_week_datetime
    ).order_by(TimeSession.start_time.asc()).all()

    dailySummary = {}
    date_iterator = start_of_week
    while date_iterator <= end_of_week:
        date_str = date_iterator.isoformat()
        dailySummary[date_str] = {"time": "-", "is_active": False}
        date_iterator += timedelta(days=1)

    weeklyTotalInSeconds = 0

    sessions_by_date = {}
    for session in sessions:
        session_date_str = session.start_time.date().isoformat()
        sessions_by_date.setdefault(session_date_str, []).append(session)

    for session_date_str, session_list in sessions_by_date.items():
        last_session = session_list[-1]

        dailyTotalInSeconds = 0
        is_active = False

        if last_session.full_elapsed_time:
            dailyTotalInSeconds = time_to_seconds(last_session.full_elapsed_time)
            weeklyTotalInSeconds += dailyTotalInSeconds
        else:
            is_active = True

        summary = dailySummary.get(session_date_str, {"time": "-", "is_active": False})
        summary["time"] = format_duration(dailyTotalInSeconds) if dailyTotalInSeconds > 0 else "-"
        summary["is_active"] = is_active
        dailySummary[session_date_str] = summary

    weeklyTotal = format_duration(weeklyTotalInSeconds)

    users = db.query(User).all()
    users_list = [{"id": user.id, "name": user.name} for user in users]

    return {
        "dailySummary": dailySummary,
        "weeklyTotal": weeklyTotal,
        "weekOffset": weekOffset,
        "users": users_list,
        "selectedUserId": selected_user.id,
    }
