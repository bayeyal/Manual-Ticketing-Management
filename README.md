# Manual Accessibility Ticketing Platform

A web application for managing digital accessibility manual testing projects.

## Features

- User authentication and role-based access control
- Project management with WCAG compliance tracking
- Task management for accessibility issues
- Real-time communication between auditors
- Screenshot capture and management
- Progress tracking and reporting
- Email notifications

## Tech Stack

- Frontend: React
- Backend: NestJS
- Database: PostgreSQL
- Authentication: JWT

## Project Structure

```
.
├── frontend/          # React frontend application
├── backend/           # NestJS backend application
└── requirements.md    # Project requirements and specifications
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database credentials and other configurations

4. Run database migrations:
   ```bash
   npm run migration:run
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Development

- Backend API will run on: http://localhost:3000
- Frontend will run on: http://localhost:3001

## License

MIT 