from contextlib import asynccontextmanager

from db.database import Base, engine
from db.mongodb import MongoDB
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analysis import router as analysis_router
from routes.change import router as change_router
from routes.webhook import router as webhook_router

mongodb = MongoDB()

@asynccontextmanager
async def lifespan(app: FastAPI) :
    await mongodb.connect()
    yield
    await mongodb.close()

app = FastAPI(lifespan=lifespan)
Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "ok": True,
        "items": ["Item one", "Item two", "Item three"],
    }


app.include_router(webhook_router)
app.include_router(change_router)
app.include_router(analysis_router)
