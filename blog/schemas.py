from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TagCreate(BaseModel):
    name: str

class ShowTag(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    body: str

class ShowComment(BaseModel):
    id: int
    body: str
    created_at: datetime
    author_name: str = ""

    @classmethod
    def from_orm_comment(cls, comment):
        return cls(
            id=comment.id,
            body=comment.body,
            created_at=comment.created_at,
            author_name=comment.author.name if comment.author else "Unknown"
        )

    class Config:
        from_attributes = True

class BlogBase(BaseModel):
    title: str
    body: str
    is_published: bool = False
    tags: List[str] = []

class UpdateBlog(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    is_published: Optional[bool] = None
    tags: Optional[List[str]] = None

class Blog(BlogBase):
    class Config:
        from_attributes = True

class User(BaseModel):
    name: str
    email: str
    password: str
    bio: Optional[str] = None

# --- NEW SCHEMA: Breaks the infinite recursion cycle ---
class UserLight(BaseModel):
    id: int
    name: str
    email: str
    bio: Optional[str] = None

    class Config:
        from_attributes = True

# ShowBlog now uses UserLight so it doesn't loop back to fetching blogs
class ShowBlog(BaseModel):
    id: int
    title: str
    body: str
    is_published: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    creator: UserLight 
    tags: List[ShowTag] = []
    comments: List[ShowComment] = []

    class Config:
        from_attributes = True

# ShowUser sits at the top of the hierarchy and can safely fetch ShowBlogs
class ShowUser(BaseModel):
    id: int
    name: str
    email: str
    bio: Optional[str] = None
    followers_count: int = 0
    following_count: int = 0
    is_following: bool = False
    blogs: List[ShowBlog] = []

    class Config:
        from_attributes = True

class Login(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None