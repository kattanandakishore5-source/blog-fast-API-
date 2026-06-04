from sqlalchemy.orm import Session, selectinload
from fastapi import HTTPException, status
from .. import models, schemas
from ..hashing import Hash

def create(request: schemas.User, db: Session):
    existing = db.query(models.User).filter(models.User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    new_user = models.User(
        name=request.name,
        email=request.email,
        password=Hash.bcrypt(request.password),
        bio=request.bio
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def show(id: int, db: Session, current_user_id: int = None):
    # Optimized query: Fetch the user and eager-load all relationships
    user = (
        db.query(models.User)
        .options(
            selectinload(models.User.blogs).selectinload(models.Blog.tags),
            selectinload(models.User.followers),
            selectinload(models.User.following)
        )
        .filter(models.User.id == id)
        .first()
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {id} not found"
        )
        
    # Dynamically calculate if the current user is following this profile
    is_following = False
    if current_user_id:
        is_following = any(follower.id == current_user_id for follower in user.followers)
    
    # Set the attribute so Pydantic picks it up for the ShowUser schema
    setattr(user, 'is_following', is_following)
        
    return user

def toggle_follow(target_user_id: int, db: Session, current_user: models.User):
    if target_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot follow yourself")
        
    target_user = db.query(models.User).filter(models.User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    active_user = db.query(models.User).options(selectinload(models.User.following)).filter(models.User.id == current_user.id).first()

    if target_user in active_user.following:
        active_user.following.remove(target_user)
        message = "Unfollowed successfully"
    else:
        active_user.following.append(target_user)
        message = "Followed successfully"
        
    db.commit()
    return {"detail": message}