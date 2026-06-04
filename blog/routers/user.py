from fastapi import APIRouter, Depends
from .. import schemas, database, oauth2, models
from sqlalchemy.orm import Session
from ..repository import user

router = APIRouter(
    prefix="/user",
    tags=['Users']
)

get_db = database.get_db

@router.post('/', response_model=schemas.ShowUser)
def create_user(request: schemas.User, db: Session = Depends(get_db)):
    return user.create(request, db)

@router.get('/me', response_model=schemas.ShowUser)
def get_me(current_user: models.User = Depends(oauth2.get_current_user), db: Session = Depends(get_db)):
    # Pass current_user.id twice (once as target id, once to check following status)
    return user.show(current_user.id, db, current_user.id)

@router.get('/{id}', response_model=schemas.ShowUser)
def get_user(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    # Pass the logged-in user's ID to compute the is_following boolean
    return user.show(id, db, current_user.id)

@router.post('/{id}/follow')
def follow_user(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    return user.toggle_follow(id, db, current_user)