from datetime import datetime, timezone
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.deps import get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.database import get_database
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse
from app.schemas.resource import ResourceCreate, ResourceResponse, ResourceUpdate
from app.schemas.user import UserResponse

auth_router = APIRouter()
resources_router = APIRouter()


@auth_router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest):
    db = get_database()
    existing_user = await db.users.find_one({"email": payload.email.lower()})
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = {
        "_id": payload.email.lower(),
        "email": payload.email.lower(),
        "password_hash": get_password_hash(payload.password),
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(user)

    token = create_access_token(subject=user["_id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(email=user["email"], created_at=user["created_at"]),
    )


@auth_router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    db = get_database()
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(subject=user["_id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(email=user["email"], created_at=user["created_at"]),
    )


@auth_router.get("/me", response_model=UserResponse)
async def me(current_user=Depends(get_current_user)):
    return UserResponse(email=current_user["email"], created_at=current_user["created_at"])


@resources_router.post("", response_model=ResourceResponse, response_model_by_alias=False, status_code=status.HTTP_201_CREATED)
async def create_resource(payload: ResourceCreate, current_user=Depends(get_current_user)):
    db = get_database()
    now = datetime.now(timezone.utc)
    resource = {
        "_id": str(uuid4()),
        "user_id": current_user["_id"],
        "title": payload.title,
        "url": str(payload.url),
        "description": payload.description,
        "tags": payload.tags,
        "created_at": now,
        "updated_at": now,
    }
    await db.resources.insert_one(resource)
    return ResourceResponse(**resource)


@resources_router.get("", response_model=list[ResourceResponse], response_model_by_alias=False)
async def list_resources(
    current_user=Depends(get_current_user),
    search: str | None = None,
    tags: Annotated[list[str] | None, Query()] = None,
):
    db = get_database()
    query: dict = {"user_id": current_user["_id"]}
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    if tags:
        query["tags"] = {"$all": [tag.strip().lower() for tag in tags if tag.strip()]}

    cursor = db.resources.find(query).sort("created_at", -1)
    resources = []
    async for item in cursor:
        item["_id"] = str(item["_id"])
        resources.append(ResourceResponse(**item))
    return resources


@resources_router.get("/{resource_id}", response_model=ResourceResponse, response_model_by_alias=False)
async def get_resource(resource_id: str, current_user=Depends(get_current_user)):
    db = get_database()
    resource = await db.resources.find_one({"_id": resource_id, "user_id": current_user["_id"]})
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return ResourceResponse(**resource)


@resources_router.put("/{resource_id}", response_model=ResourceResponse, response_model_by_alias=False)
async def update_resource(resource_id: str, payload: ResourceUpdate, current_user=Depends(get_current_user)):
    db = get_database()
    existing = await db.resources.find_one({"_id": resource_id, "user_id": current_user["_id"]})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")

    update_data = payload.model_dump(exclude_unset=True, mode="json")
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided for update")

    if "url" in update_data:
        update_data["url"] = str(update_data["url"])
    update_data["updated_at"] = datetime.now(timezone.utc)
    await db.resources.update_one({"_id": resource_id}, {"$set": update_data})
    updated = await db.resources.find_one({"_id": resource_id, "user_id": current_user["_id"]})
    return ResourceResponse(**updated)


@resources_router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(resource_id: str, current_user=Depends(get_current_user)):
    db = get_database()
    result = await db.resources.delete_one({"_id": resource_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
