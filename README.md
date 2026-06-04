# BlogR ✍️

A full-stack, minimalist blogging platform built with **FastAPI** and **React**. 

BlogR features a robust RESTful API with optimized database queries, secure JWT authentication, and a sleek, dark-mode React frontend tailored for a seamless writing and reading experience.

## ✨ Features

### Backend (FastAPI)
* **Secure Authentication:** OAuth2 password flow with JWT access tokens and bcrypt password hashing.
* **Optimized Database Queries:** Solved the N+1 query problem using SQLAlchemy's eager loading (`selectinload` and `joinedload`) for massive performance gains on nested data.
* **Social Profile System:** Self-referential Many-to-Many relationships allowing users to follow/unfollow each other and track follower counts.
* **Rich Content Models:** Support for drafting/publishing blogs, adding tags, and nested comment threads.
* **Pagination:** Built-in skip/limit pagination for the global feed.

### Frontend (React + Vite)
* **Minimalist Dark Theme:** Crafted with Tailwind CSS for a premium, distraction-free reading experience.
* **Optimistic UI:** Instant UI updates for commenting and following/unfollowing without waiting for full page reloads.
* **Auto-Save Drafts:** Uses `localStorage` to automatically save editor progress so you never lose your work.
* **Fail-Fast Validation:** Inline form validation providing instant feedback for auth and creation flows.
* **Smooth UX:** Skeleton loaders during API fetches and elegant toast notifications via `react-hot-toast`.

## 🛠️ Tech Stack

* **Backend:** Python, FastAPI, SQLAlchemy, SQLite, Passlib (Bcrypt), python-jose (JWT)
* **Frontend:** React, Vite, Tailwind CSS (v3), React Router DOM

## 📂 Project Structure

\`\`\`text
BlogR/
├── blog/                   # FastAPI Backend
│   ├── main.py             # FastAPI application instance & CORS
│   ├── models.py           # SQLAlchemy database schemas & relationships
│   ├── schemas.py          # Pydantic models for data validation
│   ├── oauth2.py           # Authentication dependency injection
│   ├── repository/         # Database interaction logic (CRUD operations)
│   └── routers/            # API Route definitions (/auth, /blog, /user)
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, etc.)
│   │   ├── pages/          # Full page views (Home, Dashboard, Editor, etc.)
│   │   ├── App.jsx         # React Router configuration
│   │   └── index.css       # Tailwind entry point
│   ├── tailwind.config.js
│   └── package.json
\`\`\`

## 🚀 Running the Project Locally

### Prerequisites
* Python 3.9+
* Node.js (v16+)
* npm or yarn

### 1. Start the Backend
Open a terminal in the root `BlogR/` directory.

\`\`\`bash
# Create and activate a virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install requirements (ensure you have generated a requirements.txt)
pip install -r requirements.txt

# Start the FastAPI server
uvicorn blog.main:app --reload
\`\`\`
*Note: FastAPI will automatically generate the `blog2.db` SQLite database file on the first run.*
*The API will be available at `http://127.0.0.1:8000`*
*Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`*

### 2. Start the Frontend
Open a **second** terminal and navigate to the `frontend` directory.

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
\`\`\`
*The frontend will be available at `http://localhost:5173`*

## 🔌 Core API Endpoints

**Authentication**
* `POST /auth/login` - Authenticate user and return JWT

**Users & Profiles**
* `POST /user/` - Register a new user
* `GET /user/me` - Get current logged-in user profile & stats
* `GET /user/{id}` - Get public user profile and published blogs
* `POST /user/{id}/follow` - Toggle follow/unfollow status

**Blogs**
* `GET /blog/` - Fetch paginated public feed
* `POST /blog/` - Create a new post (Draft or Published)
* `GET /blog/{id}` - Retrieve full post with comments and tags
* `PUT /blog/{id}` - Update a post
* `DELETE /blog/{id}` - Delete a post

**Comments**
* `POST /blog/{id}/comments` - Add a comment to a specific post
* `GET /blog/{id}/comments` - Retrieve comments for a post

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
