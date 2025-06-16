# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Team Todo App** - an educational full-stack web application designed to teach internal SEs about web application fundamentals. The project demonstrates the interaction between frontend, backend, and database layers.

## Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js + TypeScript (with JavaScript fallback)
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Development**: Docker containers via container-use MCP

## Architecture

```
Frontend (React) ↔ Backend (Express) ↔ Database (SQLite)
- User Interface    - API Endpoints      - users table
- State Management  - Authentication     - todos table  
- HTTP Client       - Business Logic
```

## Development Commands

### Backend Server
```bash
cd backend
npm run dev          # Development with ts-node (if TypeScript works)
node server.js       # JavaScript fallback version
```
Server runs on: http://localhost:3001

### Frontend Application  
```bash
cd frontend
npm start
```
Application runs on: http://localhost:3000

### Database Access
```bash
sqlite3 backend/database.sqlite
.tables
SELECT * FROM users;
SELECT * FROM todos;
```

## Key Features

1. **User Authentication**
   - User registration and login
   - JWT token-based sessions
   - Password hashing with bcrypt

2. **Todo Management**
   - Personal todos (private to user)
   - Shared todos (visible to all users)
   - CRUD operations (Create, Read, Update, Delete)
   - Completion status toggle

3. **Responsive UI**
   - Mobile-first design with Tailwind CSS
   - Tab-based navigation (All/Personal/Shared)
   - Real-time UI updates

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/me` - Get current user info (requires auth)

### Todos
- `GET /api/todos?type=all|personal|shared` - Get todos
- `POST /api/todos` - Create todo (requires auth)
- `PUT /api/todos/:id` - Update todo (requires auth)
- `DELETE /api/todos/:id` - Delete todo (requires auth)

### System
- `GET /api/health` - Health check

## Environment Variables

Backend `.env` file:
```
PORT=3001
JWT_SECRET=dev_secret_key_for_learning
JWT_EXPIRES_IN=7d
DATABASE_PATH=./database.sqlite
```

## Known Issues

1. **TypeScript Compilation**: The TypeScript backend has type errors. Use the JavaScript version (`server.js`) for now.
2. **Development Focus**: This is an educational project - not production-ready.
3. **Security**: Uses development-grade security settings.

## Learning Objectives

This project demonstrates:
- **Three-tier architecture** (Presentation → Business Logic → Data)
- **RESTful API design** 
- **Authentication flows** with JWT
- **State management** in React
- **Database design** and relationships
- **CORS configuration** for cross-origin requests
- **Environment configuration** and security practices