from fastapi import FastAPI
from typing import Optional
from pydantic import BaseModel 

app = FastAPI()

@app.get("/blog")
def index(limit: int = 10, published: bool = True, sort: Optional[str] = None):
    if published:
        return {'data': f'{limit} published blogs from the list'}  # Added space
    else:
        return {'data': f'{limit} unpublished blogs from the db'}  # Fixed logic string

@app.get("/blog/unpublished")
def about():
    return {'data': 'all unpublished'}

@app.get('/blog/{id}')
def show(id: int):
    return {'data': id}

@app.get('/blog/{id}/comments')
def comments(id: int):
    return {'data': {'blog_id': id, 'comments': ['comment 1', 'comment 2']}}


class Blog(BaseModel):
    title: str
    body: str
    published: Optional[bool] = True

@app.post('/blog')
def create_blog(request: Blog):
    return {
        'message': "Blog is created",
        'data': request
    }