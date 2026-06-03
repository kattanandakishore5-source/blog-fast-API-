from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from .. import models, schemas


def get_all(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Blog).offset(skip).limit(limit).all()


def create(request: schemas.BlogBase, db: Session, current_user: models.User):
    new_blog = models.Blog(
        title=request.title,
        body=request.body,
        user_id=current_user.id
    )
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    return new_blog


def destroy(id: int, db: Session, current_user: models.User):
    blog = db.query(models.Blog).filter(models.Blog.id == id).first()

    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog with id {id} not found"
        )

    if blog.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this blog"
        )

    db.delete(blog)
    db.commit()
    return {"detail": "Blog deleted successfully"}


def update(id: int, request: schemas.BlogBase, db: Session, current_user: models.User):
    blog = db.query(models.Blog).filter(models.Blog.id == id).first()

    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog with id {id} not found"
        )

    if blog.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this blog"
        )

    blog.title = request.title
    blog.body = request.body
    db.commit()
    db.refresh(blog)
    return blog


def show(id: int, db: Session):
    blog = db.query(models.Blog).filter(models.Blog.id == id).first()

    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog with id {id} not found"
        )

    return blog