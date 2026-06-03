from sqlalchemy.orm import Session
from fastapi import Response, status
from .. import models, schemas


def get_all(db: Session):
    return db.query(models.Blog).all()


def create(request: schemas.BlogBase, db: Session, current_user_email: str):
    user = db.query(models.User).filter(models.User.email == current_user_email).first()
    new_blog = models.Blog(title=request.title, body=request.body, user_id=user.id)
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    return new_blog


def destroy(id: int, db: Session):
    blog = db.query(models.Blog).filter(models.Blog.id == id).first()
    if not blog:
        return Response(
            content=f"Blog with id {id} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
    db.delete(blog)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def update(id: int, request: schemas.BlogBase, db: Session):
    blog = db.query(models.Blog).filter(models.Blog.id == id).first()
    if not blog:
        return Response(
            content=f"Blog with id {id} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
    blog.title = request.title
    blog.body = request.body
    db.commit()
    db.refresh(blog)
    return blog


def show(id: int, db: Session):
    blog = db.query(models.Blog).filter(models.Blog.id == id).first()
    if not blog:
        return Response(
            content=f"Blog with id {id} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
    return blog