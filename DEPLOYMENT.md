# Deployment Guide for Render

This project consists of two parts that need to be deployed separately on Render:
1.  **Backend** (Python FastAPI)
2.  **Frontend** (React Static Site)

## Part 1: Deploy the Backend (Python)

1.  Push your code to GitHub.
2.  Go to [Render Dashboard](https://dashboard.render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Root Directory**: `LnagExtract/backend`
6.  **Runtime**: Python 3
7.  **Build Command**: `pip install -r requirements.txt`
8.  **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
9.  **Environment Variables** (Where to put OpenAI Key):
    *   **Key**: `OPENAI_API_KEY`
    *   **Value**: `sk-proj-...` (Your actual OpenAI API Key, starting with sk-)
10. Click **Create Web Service**.
11. **Copy the URL** once deployed (e.g., `https://lnagextract-backend.onrender.com`).

## Part 2: Deploy the Frontend (React)

1.  Go to Render Dashboard.
2.  Click **New +** -> **Static Site**.
3.  Connect the same GitHub repository.
4.  **Root Directory**: `LnagExtract/frontend`
5.  **Build Command**: `npm install; npm run build`
6.  **Publish Directory**: `dist`
7.  **Environment Variables** (Where to link the Backend):
    *   **Key**: `VITE_BACKEND_URL`
    *   **Value**: Paste the Backend URL from Part 1 (e.g., `https://lnagextract-backend.onrender.com`)
    *   *Note: Do not include a trailing slash `/` at the end.*
8.  Click **Create Static Site**.

## Quick Summary
| Service | Variable Name | Value to Paste |
| :--- | :--- | :--- |
| **Backend** | `OPENAI_API_KEY` | Your **OpenAI API Key** (sk-...) |
| **Frontend** | `VITE_BACKEND_URL` | Your **Deployed Backend URL** |
