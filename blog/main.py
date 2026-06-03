from fastapi import FastAPI
from . import models
from .routers import blog, user, authentication
from .database import engine

app = FastAPI()

# Automatically generates your database tables on startup
models.Base.metadata.create_all(bind=engine)

app.include_router(blog.router)
app.include_router(user.router)
app.include_router(authentication.router)