from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import engine, Base, get_db
from . import models

# Initialize FastAPI app BEFORE creating tables
app = FastAPI(
    title="Electricity Contracts & Complaints API",
    description="MVP Backend for contract and complaint management",
    version="1.0.0"
)

# CORS configuration (allow frontend origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables automatically on startup (if they don't exist)
@app.on_event("startup")
def startup_event():
    """Create all tables on app startup"""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        # Tables might already exist, which is fine
        print(f"Note: Tables already exist or skipping: {e}")

# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================

@app.get("/")
def root():
    """Root endpoint"""
    return {"status": "Backend running", "version": "1.0.0"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check - verifies DB connection"""
    try:
        # Simple query to test DB connection
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "message": "Aiven MySQL connection successful"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

# ============================================================================
# PLACEHOLDER ROUTES (To be implemented)
# ============================================================================

# TODO: Implement customer management endpoints
# TODO: Implement meter management endpoints
# TODO: Implement contract management endpoints
# TODO: Implement complaint management endpoints
# TODO: Implement tariff endpoints

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
