# Manual Ticketing Management Platform

A platform for managing accessibility tickets and audits.

## Features

- User authentication and authorization
- Project management
- Task tracking
- Audit management
- Real-time updates

## Tech Stack

- Frontend: React
- Backend: NestJS
- Database: PostgreSQL
- Authentication: JWT

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR-USERNAME/Manual-Ticketing-Management.git
cd Manual-Ticketing-Management
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
- Copy `.env.example` to `.env` in the backend directory
- Update the database credentials and other settings

4. Start the development servers
```bash
# Start backend (from backend directory)
npm run start:dev

# Start frontend (from frontend directory)
npm start
```

## Development

- Backend runs on: http://localhost:3000
- Frontend runs on: http://localhost:3001

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License. 