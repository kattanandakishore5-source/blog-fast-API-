from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

blog_tags = Table(
    "blog_tags",
    Base.metadata,
    Column("blog_id", Integer, ForeignKey("blogs.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)

# New Association Table for the Follower System
followers_table = Table(
    "followers",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("followed_id", Integer, ForeignKey("users.id"), primary_key=True),
)

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    body = Column(String)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    creator = relationship("User", back_populates="blogs")
    comments = relationship("Comment", back_populates="blog", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=blog_tags, back_populates="blogs")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    bio = Column(String, nullable=True)

    blogs = relationship("Blog", back_populates="creator")
    comments = relationship("Comment", back_populates="author")

    # Self-referential Many-to-Many Relationships
    following = relationship(
        "User",
        secondary=followers_table,
        primaryjoin=(id == followers_table.c.follower_id),
        secondaryjoin=(id == followers_table.c.followed_id),
        back_populates="followers"
    )
    
    followers = relationship(
        "User",
        secondary=followers_table,
        primaryjoin=(id == followers_table.c.followed_id),
        secondaryjoin=(id == followers_table.c.follower_id),
        back_populates="following"
    )

    # Computed properties for the schema
    @property
    def followers_count(self) -> int:
        return len(self.followers)

    @property
    def following_count(self) -> int:
        return len(self.following)

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    body = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    blog_id = Column(Integer, ForeignKey("blogs.id"))
    author_id = Column(Integer, ForeignKey("users.id"))

    blog = relationship("Blog", back_populates="comments")
    author = relationship("User", back_populates="comments")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    blogs = relationship("Blog", secondary=blog_tags, back_populates="tags")