# Sydney Events Scraper & Manager

A full-stack MERN application that scrapes event data from public websites, allows users to view and subscribe to events, and provides an admin dashboard for management.

## Project Structure

- **frontend/**: React + Vite + Tailwind CSS application.
- **backend/**: Node.js + Express + MongoDB + Puppeteer scraper.

## Prerequisites

- Node.js installed.
- MongoDB installed and running locally.
- Google Cloud Console Project (for OAuth).

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` with your actual credentials:
   - `MONGO_URI`: Your MongoDB connection string (default provided works for local).
   - `GOOGLE_CLIENT_ID`: Get from Google Cloud Console.
   - `GOOGLE_CLIENT_SECRET`: Get from Google Cloud Console.

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. **Start the Backend**:
   - The backend runs the API servers and the Puppeteer scraper.
   - The scraper runs automatically on startup and then every 4 hours.
   ```bash
   cd backend
   npm start
   ```
   *Note: First run might take a moment to launch Puppeteer and scrape initial events.*

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   - Open your browser to `http://localhost:5173`.

## Features

- **Public View**: Browse scraped events, filter by City (keyword), and detail view.
- **Get Tickets**: Click "Get Tickets" to open the email capture modal.
- **Admin Dashboard**: Access at `/dashboard` (Redirects to Google Login). View valid events, filter by status, and "Import" events to the official list.
- **Scraper**: Automatically finds events from *What's On Sydney*.

## Technologies

- **Frontend**: React, TailwindCSS, Lucide Icons, Axios.
- **Backend**: Express, Mongoose, Passport.js (Google Auth).
- **Scraping**: Puppeteer, Cheerio.
- **Scheduling**: Node-Cron.
