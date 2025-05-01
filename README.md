# Video Conference Application

A LiveKit-powered video conferencing platform for webinars and meetings with core functionality similar to Zoom.

## Key Features

- Real-time video conferencing with LiveKit integration
- Chat functionality using WebSockets
- Meeting creation and management
- User authentication
- Host controls for meetings
- Persistent data storage with PostgreSQL

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure environment variables
   - Copy `.env.example` to `.env`
   - Update the PostgreSQL connection details in `.env`

4. Create the database
   ```
   # Using psql
   psql -U postgres
   CREATE DATABASE video_conference_app;
   ```

5. Push database schema
   ```
   npm run db:push
   ```

6. Start the development server
   ```
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express server
- `/shared` - Shared types and schemas

## Database Schema

The application uses the following PostgreSQL tables:

- `users` - User accounts
- `meetings` - Meeting details
- `participants` - Meeting participants
- `messages` - Chat messages

## Technology Stack

- **Frontend**: React, Wouter, TanStack Query, Shadcn UI Components
- **Backend**: Express, WebSockets
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: LiveKit
- **Authentication**: Passport.js