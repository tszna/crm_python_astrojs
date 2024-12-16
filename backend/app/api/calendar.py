from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..core.security import get_current_user
from ..db.database import get_db
from ..models.models import User
from ..schemas.schemas import AbsenceCreate
from ..services.calendar_service import get_calendar, create_absence

router = APIRouter(prefix="/api")

@router.get("/calendar")
def get_calendar_route(
    monthOffset: int = Query(0),
    user_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id is None:
        selected_user = current_user
    else:
        selected_user = db.query(User).filter(User.id == user_id).first()
        if selected_user is None:
            raise HTTPException(status_code=404, detail="Nie znaleziono użytkownika.")

    return get_calendar(monthOffset, selected_user, db)

@router.post("/absences/store")
def store_absence(
    absence_data: AbsenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_absence = create_absence(
        user=current_user,
        start_date=absence_data.start_date,
        end_date=absence_data.end_date,
        reason=absence_data.reason,
        db=db
    )

    return {
        "successMessage": "Nieobecność została dodana.",
        "absence": {
            "id": new_absence.id,
            "start_date": new_absence.start_date,
            "end_date": new_absence.end_date,
            "reason": new_absence.reason
        }
    }
