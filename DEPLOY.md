# Deployment Guide

This project is split into a Node/Express backend and a React/Vite frontend.

## Recommended deployment setup

### 1) Backend (Render)
- Create a new Web Service on Render.
- Connect this repository.
- Set the service root to `backend`.
- Use the default build command:
  `npm install`
- Use the start command:
  `npm start`
- Add environment variables:
  - `NODE_ENV=production`
  - `PORT=5000`
  - `MONGO_URI=<your MongoDB Atlas connection string>`
  - `JWT_SECRET=<strong secret>`
  - `CLIENT_URL=https://<your-frontend-domain>`

### 2) Frontend (Vercel or Netlify)
- Import the frontend folder as a new frontend project.
- Framework preset: Vite.
- Build command:
  `npm install && npm run build`
- Output directory:
  `dist`
- Set environment variable:
  - `VITE_API_URL=https://<your-render-backend-url>/api`

### 3) Database
Use MongoDB Atlas.
- Create a cluster.
- Allow network access from all IPs or the hosting platform IPs.
- Copy the connection string into `MONGO_URI`.

## Production notes
- `CLIENT_URL` should be the deployed frontend URL.
- `VITE_API_URL` should be the deployed backend URL plus `/api`.
- The backend health endpoint is `/api/health`.

## Local run
- Backend: `cd backend && cp .env.example .env && npm install && npm run seed && npm run dev`
- Frontend: `cd frontend && cp .env.example .env && npm install && npm run dev`
