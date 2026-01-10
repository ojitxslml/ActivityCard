# Activity Card Generator

A GitHub activity card generator with a React frontend and NestJS backend.

## Project Structure

```
activitycard/
├── frontend/          # React + Vite frontend
│   ├── src/          # Frontend source code
│   ├── public/       # Static assets
│   └── ...
├── backend/          # NestJS backend
│   ├── src/          # Backend source code
│   └── ...
└── package.json      # Root package.json with scripts
```

## Getting Started

### Install Dependencies

```bash
npm run install:all
```

### Development

Run both frontend and backend concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Frontend only (http://localhost:5173)
npm run dev:frontend

# Backend only (http://localhost:3000)
npm run dev:backend
```

### Build

```bash
npm run build
```

## Features

- **Stats Card**: Display GitHub statistics
- **Streak Card**: Show contribution streaks with activity graph
- **43 Themes**: Multiple color schemes available
- **Real GitHub Data**: Uses GitHub API with token authentication
- **Custom Colors**: Create your own color scheme

## Environment Variables

Create a `.env` file in the `backend` folder:

```env
GITHUB_TOKEN=your_github_token_here
```

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: NestJS, TypeScript
- **Styling**: CSS with custom design system
