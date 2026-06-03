from typing import List
from fastapi import APIRouter, Depends, status
from .. import schemas, database, oauth2, models
from sqlalchemy.orm import Session
from ..repository import blog

router = APIRouter(
    prefix="/blog",
    tags=['Blogs']
)

get_db = database.get_db


@router.get('/', response_model=List[schemas.ShowBlog])
def all_blogs(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    return blog.get_all(db, skip=skip, limit=limit)


@router.post('/', status_code=status.HTTP_201_CREATED, response_model=schemas.ShowBlog)
def create_blog(
    request: schemas.BlogBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    return blog.create(request, db, current_user)


@router.delete('/{id}', status_code=status.HTTP_200_OK)
def destroy(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    return blog.destroy(id, db, current_user)


@router.put('/{id}', status_code=status.HTTP_202_ACCEPTED, response_model=schemas.ShowBlog)
def update(
    id: int,
    request: schemas.BlogBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    return blog.update(id, request, db, current_user)


@router.get('/{id}', status_code=status.HTTP_200_OK, response_model=schemas.ShowBlog)
def show(id: int, db: Session = Depends(get_db)):
    return blog.show(id, db)