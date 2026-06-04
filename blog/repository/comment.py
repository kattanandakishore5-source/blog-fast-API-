from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from .. import models, schemas

def add_comment(blog_id: int, request: schemas.CommentCreate, db: Session, current_user: models.User):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Blog {blog_id} not found")

    comment = models.Comment(
        body=request.body,
        blog_id=blog_id,
        author_id=current_user.id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

def get_comments(blog_id: int, db: Session):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Blog {blog_id} not found")
    
    return db.query(models.Comment).options(joinedload(models.Comment.author)).filter(models.Comment.blog_id == blog_id).all()