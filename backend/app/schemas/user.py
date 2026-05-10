from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    email: EmailStr
    created_at: datetime
