from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, listings, bookings, wishlist

app = FastAPI(title="Airbnb Clone API")

import os
cors_origin = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[cors_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(wishlist.router)

@app.get("/api/hello")
def read_root():
    return {"message": "Hello from FastAPI"}
