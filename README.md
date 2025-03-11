# FastAPI + React Application

This application consists of a FastAPI backend and a React frontend. Follow the setup instructions below to get started.

## Prerequisites
Make sure you have the following installed:
- Python 3.11+
- Node.js and npm
- PostgreSQL

## Setup Instructions

### Backend Setup
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Create a virtual environment if it does not exist:
   ```sh
   python -m venv venv
   ```
3. Activate the virtual environment:
   ```sh
   # Windows
   .\venv\Scripts\activate

   # macOS/Linux
   source venv/bin/activate
   ```
4. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
5. Create a `.env` file from the `.env.example` file and update the necessary environment variables.
6. Run the FastAPI application using Uvicorn:
   ```sh
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   npm install axios
   ```
3. Start the frontend application:
   ```sh
   npm start
   ```

## Environment Variables
Make sure to create a `.env` file based on `.env.example` and update the necessary configuration values. This file should include:
- Database connection settings
- Other application configurations

## Additional Notes
- The backend runs on FastAPI using Uvicorn.
- The frontend is built using React.
- Ensure your PostgreSQL database is running before starting the backend.

