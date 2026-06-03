from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .routers import blog, user, authentication
from .database import engine

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(blog.router)
app.include_router(user.router)
app.include_router(authentication.router)