from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth_router, resources_router
from app.core.config import settings
from app.db.database import close_mongo_connection, connect_to_mongo, get_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_to_mongo()
    db = get_database()
    await db.users.create_index("email", unique=True)
    await db.resources.create_index([("user_id", 1), ("title", 1)])
    await db.resources.create_index([("user_id", 1), ("tags", 1)])
    yield
    await close_mongo_connection()


app = FastAPI(
    title="Personal Knowledge Hub API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(resources_router, prefix="/api/resources", tags=["resources"])


@app.get("/api/health", summary="Health check")
async def health_check():
    return {"status": "ok"}
