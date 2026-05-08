from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.core.security import create_access_token
from app.models.auth import TokenRequest, TokenResponse

router = APIRouter(prefix="/auth")

# 개발용 임시 자격증명 — 프로덕션에서는 DB로 교체
_USERS = {"admin": "admin", "operator": "drone1234"}


@router.post("/token", response_model=TokenResponse)
async def get_token(body: TokenRequest) -> TokenResponse:
    if _USERS.get(body.username) != body.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="인증 실패")
    token = create_access_token(subject=body.username)
    return TokenResponse(
        access_token=token,
        expires_in=settings.JWT_EXPIRE_MINUTES * 60,
    )
