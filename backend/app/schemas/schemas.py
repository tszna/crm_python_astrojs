from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    email_verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LoginData(BaseModel):
    email: str
    password: str

class CurrentSessionOut(BaseModel):
    start_time: Optional[str] 
    end_time: Optional[str]
    elapsed_time: str          
    count_time: int           
    is_active: bool

    class Config:
        from_attributes = True

# Absence schemas
class AbsenceCreate(BaseModel):
    start_date: date = Field(..., title="Data początkowa nieobecności")
    end_date: date = Field(..., title="Data końcowa nieobecności")
    reason: str = Field(..., title="Powód nieobecności")

    @validator('end_date')
    def validate_dates(cls, v, values):
        start_date = values.get('start_date')
        if start_date and v < start_date:
            raise ValueError('Data końcowa musi być po lub równa dacie początkowej')
        return v

    class Config:
        from_attributes = True

class AbsenceOut(BaseModel):
    id: int
    user_id: int
    start_date: date
    end_date: date
    reason: str

    class Config:
        from_attributes = True

class WeeklySummaryResponse(BaseModel):
    dailySummary: Dict[str, Dict[str, Any]]
    weeklyTotal: str
    weekOffset: int
    users: List[Dict[str, Any]]
    selectedUserId: int

class CalendarResponse(BaseModel):
    calendar: Dict[str, Dict[str, Any]]
    currentMonth: str
    formattedCurrentMonth: str
    monthOffset: int
    users: List[Dict[str, Any]]
    selectedUserId: int
