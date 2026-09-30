from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import engine, Base
from routes.workouts import router as workouts_router
from routes.goals import router as goals_router
from routes.progress import router as progress_router
from routes.ai import router as ai_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FitAI", description="Adaptive Fitness & Workout Coach API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workouts_router)
app.include_router(goals_router)
app.include_router(progress_router)
app.include_router(ai_router)


@app.get("/")
def root():
    return {"message": "FitAI API is running", "docs": "/docs"}
