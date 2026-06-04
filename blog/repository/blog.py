from sqlalchemy.orm import Session, selectinload, joinedload
from fastapi import HTTPException, status
from .. import models, schemas

def _get_or_create_tags(db: Session, tag_names: list[str]) -> list[models.Tag]:
    if not tag_names:
        return []
    
    # Deduplicate and clean tag names
    cleaned_names = list(set([name.strip().lower() for name in tag_names]))
    
    # Fetch all existing tags in one query
    existing_tags = db.query(models.Tag).filter(models.Tag.name.in_(cleaned_names)).all()
    existing_tag_names = {tag.name for tag in existing_tags}
    
    # Bulk create missing tags
    new_tags = [models.Tag(name=name) for name in cleaned_names if name not in existing_tag_names]
    
    if new_tags:
        db.add_all(new_tags)
        db.flush()
        
    return existing_tags + new_tags

def get_all(db: Session, skip: int = 0, limit: int = 10):
    return (
        db.query(models.Blog)
        .options(
            joinedload(models.Blog.creator),
            selectinload(models.Blog.tags),
            selectinload(models.Blog.comments).joinedload(models.Comment.author)
        )
        .filter(models.Blog.is_published == True)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create(request: schemas.BlogBase, db: Session, current_user: models.User):
    tags = _get_or_create_tags(db, request.tags)
    new_blog = models.Blog(
        title=request.title,
        body=request.body,
        is_published=request.is_published,
        user_id=current_user.id,
        tags=tags,
    )
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    return new_blog

def destroy(id: int, db: Session, current_user: models.User):
    blog = db.query(models.Blog).filter(models.Blog.id == id).first()

    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Blog {id} not found")
    if blog.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    db.delete(blog)
    db.commit()
    return {"detail": "Blog deleted successfully"}

def update(id: int, request: schemas.UpdateBlog, db: Session, current_user: models.User):
    blog = db.query(models.Blog).options(selectinload(models.Blog.tags)).filter(models.Blog.id == id).first()

    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Blog {id} not found")
    if blog.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    if request.title is not None:
        blog.title = request.title
    if request.body is not None:
        blog.body = request.body
    if request.is_published is not None:
        blog.is_published = request.is_published
    if request.tags is not None:
        blog.tags = _get_or_create_tags(db, request.tags)

    db.commit()
    db.refresh(blog)
    return blog

def show(id: int, db: Session):
    blog = (
        db.query(models.Blog)
        .options(
            joinedload(models.Blog.creator),
            selectinload(models.Blog.tags),
            selectinload(models.Blog.comments).joinedload(models.Comment.author)
        )
        .filter(models.Blog.id == id)
        .first()
    )
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Blog {id} not found")
    return blog