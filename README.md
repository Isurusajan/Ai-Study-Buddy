# AI Study Buddy

An intelligent study platform that combines AI-powered learning tools with multiplayer battle mode to make studying interactive and engaging.

## Features

- **Smart Learning Tools**: PDF summarization, quiz generation, and AI-powered Q&A
- **Battle Mode**: Real-time multiplayer quiz competitions with ELO ranking system
- **User Authentication**: Secure login and registration with JWT
- **Deck Management**: Create, organize, and manage study decks
- **Study Tracking**: Track study time, streaks, and performance metrics
- **Mobile Optimized**: Fully responsive design for all devices

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB Atlas
- **Deployment**: AWS Amplify (frontend), EC2 + Nginx (backend)
- **AI**: Google Gemini API

## Quick Start

### Prerequisites
- Node.js and npm
- MongoDB Atlas account
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Isurusajan/Ai-Study-Buddy.git
cd Ai-Study-Buddy
```

2. Install dependencies:
```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

3. Set up environment variables:
```bash
# server/.env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development servers:
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm start
```

## Project Structure

```
Ai-Study-Buddy/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Auth context
│   │   └── utils/         # API utilities
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   └── package.json
└── README.md
```

## Main Features

### Study Tools
- **PDF Summarization**: Generate summaries of uploaded documents
- **Quiz Generation**: Auto-generate quizzes with multiple difficulty levels
- **Question Practice**: Short answer and long answer question practice
- **AI Q&A**: Ask questions about your study materials

### Battle Mode
- **Real-time Multiplayer**: Challenge other students in live quiz battles
- **ELO Rating System**: Track your competitive ranking
- **Match Lobbies**: Join or create battle rooms
- **Live Results**: Real-time scoreboard and statistics

### User System
- **Authentication**: Secure JWT-based auth
- **User Statistics**: Track performance across all study modes
- **Study Streaks**: Maintain daily study consistency
- **Progress Tracking**: Monitor improvement over time

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Decks
- `GET /api/decks` - List user's decks
- `POST /api/decks` - Create new deck
- `GET /api/decks/:id` - Get deck details
- `DELETE /api/decks/:id` - Delete deck
- `POST /api/decks/:id/summary` - Generate summary
- `POST /api/decks/:id/quiz` - Generate quiz

### Battles
- `POST /api/battles/create` - Create battle room
- `GET /api/battles/:id` - Get battle details
- `POST /api/battles/:id/join` - Join battle room

## Deployment

### Frontend (AWS Amplify)
- Connected to GitHub repository
- Auto-deploys on push to main branch
- Hosted at: https://main.d1dg86wxbzr6zt.amplifyapp.com

### Backend (EC2 + Nginx)
- Node.js server running on EC2
- Nginx reverse proxy with SSL/TLS
- PM2 process manager for reliability
- Production URL: https://aistudybuddy.duckdns.org

## License

This project is private and for educational purposes.

## Contact

For questions or feedback, please open an issue on GitHub.
