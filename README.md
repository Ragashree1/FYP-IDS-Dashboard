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
- Database connection settings (DATABASE_URL, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)
- API_KEY (go to https://www.abuseipdb.com/ and sign up to get api key)
- Set SECRET_KEY, ALGORITHM, and ACCESS_EXPIRE_MINUTES

### Mailtrap API Integration

#### Step 1: Sign Up for Mailtrap
1. Go to the [Mailtrap website](https://mailtrap.io/).
2. If you don’t have an account, click **Sign Up** and create an account using your email or a social login option.
3. If you already have an account, click **Login** and enter your credentials.

#### Step 2: Create a New Inbox (Optional)
1. Once logged in, you will be redirected to the dashboard.
2. Click **Create inbox** to create a new inbox for testing emails.
3. Follow the prompts to set up the inbox, and you’ll receive SMTP credentials to send and test emails.

#### Step 3: Retrieve `MAILTRAP_API_URL` and `MAILTRAP_API_KEY`
1. After logging in, click on your **Account name** (or **Team Settings**) in the top-right corner.
2. From the dropdown menu, select **API Tokens** or **API settings**.
3. You will find the **API URL** and **API Key** here. 
   - The `MAILTRAP_API_URL` is typically: `https://api.mailtrap.io/api/v1/`
   - The `MAILTRAP_API_KEY` is a long alphanumeric key used for authentication.

#### Step 4: Store the Credentials
Once you have both the `MAILTRAP_API_URL` and `MAILTRAP_API_KEY`, store them in your project’s environment file (`.env` or similar):
```bash
MAILTRAP_API_URL="https://api.mailtrap.io/api/v1/"
MAILTRAP_API_KEY="your_api_key_here"

## Additional Notes
- The backend runs on FastAPI using Uvicorn.
- The frontend is built using React.
- Ensure your PostgreSQL database is running before starting the backend.

