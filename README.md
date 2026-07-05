# 🌟 English Companion

An interactive AI-powered English learning application built with React, Hono, Bun, and Llama 3.1 70B. Practice your English daily, expand your vocabulary, and write journals with instant, strict grammatical feedback.

## Features
- **💬 Daily AI Conversation**: Practice chatting in English with Emma (Llama 3.1).
- **⏱️ Real-time Metrics**: Track your Words Per Minute (WPM), Reaction Time, and Day Streaks.
- **🎯 Smart Confidence Score**: Evaluates your grammar, context understanding, speed, and length.
- **📚 Auto-Vocabulary Extraction**: Emma automatically finds difficult words you struggle with and saves them to your Vocab Review list.
- **📓 Strict AI Journal**: Write your daily journal and let AI correct your grammar, suggest native rewrites, and extract new vocabulary.
- **📱 Fully Responsive UI**: Looks and feels like a native mobile app on your smartphone with a Fixed Chat UI and Bottom Navigation Bar.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Tanstack Query
- **Backend**: Hono, Bun
- **Database**: PostgreSQL (Drizzle ORM)
- **AI Engine**: OpenRouter (Llama 3.1 8B Instruct / 70B Instruct / Nemotron)

## Local Development

### 1. Setup Database & Env
1. Install PostgreSQL and create a database.
2. Create a `.env` file in the `server` folder:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/convers
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 2. Install Dependencies
```bash
# In client folder
cd client && npm install

# In server folder
cd server && bun install
```

### 3. Initialize Database
```bash
cd server
bunx drizzle-kit push
```

### 4. Run Development Servers
```bash
# Terminal 1 (Backend)
cd server && npm run dev

# Terminal 2 (Frontend)
cd client && npm run dev
```
Open `http://localhost:5173` in your browser.

## Deployment (Render)

This project is configured as a Monolithic Web Service on Render.

1. Push this repository to GitHub.
2. Create a new **Web Service** on Render.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` configuration and set up the build (`npm run build` on client) and start commands.
5. In the Render Dashboard, add your **Environment Variables**:
   - `DATABASE_URL` (Use Supabase or Neon for a free, persistent PostgreSQL database).
   - `OPENROUTER_API_KEY`.
6. Deploy! Your app will serve both the React frontend and Hono backend from the same Render URL.
