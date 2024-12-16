from datetime import date, datetime
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from calendar import monthrange
from dateutil.relativedelta import relativedelta
from babel.dates import format_date
import locale

from ..models.models import User, Absence

def get_absence_letter(reason: str) -> str:
    mapping = {
        "Urlop_zwykły": "U - Urlop zwykły",
        "Urlop_bezpłatny": "Ub - Urlop bezpłatny",
        "Nadwyżka": "Nad - Wolne z nadwyżki",
        "Praca_zdalna": "Z - Praca zdalna",
        "Delegacja": "D - Delegacja",
        "Choroba": "C",
    }
    return mapping.get(reason, "Inny")

def get_calendar(monthOffset: int, selected_user: User, db: Session) -> Dict[str, Any]:
    today = date.today()
    first_day_current_month = today.replace(day=1)
    current_month = first_day_current_month + relativedelta(months=monthOffset)
    days_in_month = monthrange(current_month.year, current_month.month)[1]

    try:
        locale.setlocale(locale.LC_TIME, 'pl_PL.UTF-8')
    except locale.Error:
        locale.setlocale(locale.LC_TIME, 'pl_PL')

    formatted_current_month = format_date(current_month, 'LLLL yyyy', locale='pl_PL').capitalize()

    start_of_month = current_month
    end_of_month = current_month.replace(day=days_in_month)

    absences = db.query(Absence).filter(
        Absence.user_id == selected_user.id,
        Absence.end_date >= start_of_month,
        Absence.start_date <= end_of_month
    ).all()

    calendar = {}
    for day in range(1, days_in_month + 1):
        date_obj = current_month.replace(day=day)
        day_key = str(day)
        day_info = {
            "day_of_week": format_date(date_obj, 'EEEE', locale='pl_PL'),
            "status": "",
            "is_today": date_obj == today
        }
        calendar[day_key] = day_info

    for absence in absences:
        start_day = max(absence.start_date, start_of_month).day
        end_day = min(absence.end_date, end_of_month).day
        letter = get_absence_letter(absence.reason)

        for day in range(start_day, end_day + 1):
            day_key = str(day)
            if day_key in calendar:
                calendar[day_key]["status"] = letter

    users = db.query(User).all()
    users_list = [{"id": user.id, "name": user.name} for user in users]

    return {
        "calendar": calendar,
        "currentMonth": current_month.isoformat(),
        "formattedCurrentMonth": formatted_current_month,
        "monthOffset": monthOffset,
        "users": users_list,
        "selectedUserId": selected_user.id
    }

def create_absence(user: User, start_date: date, end_date: date, reason: str, db: Session) -> Absence:
    new_absence = Absence(
        user_id=user.id,
        start_date=start_date,
        end_date=end_date,
        reason=reason,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )

    db.add(new_absence)
    db.commit()
    db.refresh(new_absence)

    return new_absence
