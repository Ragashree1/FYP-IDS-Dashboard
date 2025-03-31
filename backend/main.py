import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.journal_controller import router as journal_router
from controllers.meeting_minutes_controller import router as meeting_minutes_router
from controllers.log_controller import router as logs_router
from controllers.login_controller import router as login_router
from controllers.registration_controller import router as registration_router 
from controllers.payment_controller import router as payment_router 
from controllers.user_management_controller import router as user_management_router 
from controllers.role_permission_controller import router as role_permission_router 


app = FastAPI()

<<<<<<< Updated upstream
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", #This one is an attempt to fix bugs
    "http://localhost:3006",  # put Frontend URL here
    "http://localhost:9600"
=======
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize database with roles on startup
@app.on_event("startup")
async def startup_event():
    init_database()

# CORS settings - Updated to be more permissive for development
origins = [
    "http://localhost:3000",  # Frontend origin
    "http://127.0.0.1:3000",  # Alternate localhost origin
    "http://localhost:3006",  # Add any other origins as needed
    "http://localhost:9600",
    "*"  # Allow all origins during development (remove in production)
>>>>>>> Stashed changes
]

app.add_middleware(
    CORSMiddleware,
<<<<<<< Updated upstream
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["X-Requested-With", "Content-Type"],  # Allow Authorization header
)

=======
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url}")
    # Log CORS headers for debugging
    print(f"Request headers: {request.headers}")
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    # Add CORS headers to all responses
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.get("/login/get_token")
async def get_token(token: str = Depends(oauth2_scheme)):
    try:
        # Replace 'your-secret-key' and 'your-algorithm' with actual values
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        print('Payload:', payload)
        print('valid')
        return {"message": "Token is valid"}
    except JWTError as e:
        print(f"Token validation error: {e}")  # Debug log
        raise HTTPException(status_code=403, detail="Invalid or expired token")

>>>>>>> Stashed changes
# Include the routers
app.include_router(journal_router)
app.include_router(meeting_minutes_router)
app.include_router(logs_router)
app.include_router(login_router)
app.include_router(registration_router)
app.include_router(payment_router)
app.include_router(user_management_router)
app.include_router(role_permission_router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
