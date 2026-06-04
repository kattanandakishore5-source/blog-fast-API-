from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, database, oauth2, models
from ..repository import comment
from ..schemas import ShowComment

router = APIRouter(
    prefix="/blog",
    tags=["Comments"],
)

get_db = database.get_db


@router.post("/{blog_id}/comments", status_code=status.HTTP_201_CREATED)
def add_comment(
    blog_id: int,
    request: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    return comment.add_comment(blog_id, request, db, current_user)


@router.get("/{blog_id}/comments")
def get_comments(
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    comments = comment.get_comments(blog_id, db)
    return [ShowComment.from_orm_comment(c) for c in comments]