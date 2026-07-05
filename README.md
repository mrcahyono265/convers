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

## Deployment (AWS EC2 / VPS)

This project is configured with a Multi-stage Dockerfile and a GitHub Actions CI/CD pipeline.

### 1. GitHub Actions (Auto-Build)
1. Push this repository to GitHub.
2. Go to the **Actions** tab in your repository and wait for the "Docker Image CI" workflow to finish.
3. Once built, go to your repository's **Packages** on the right sidebar.
4. Click on the package, go to **Package Settings**, and change the visibility from **Private** to **Public**.

### 2. Deploy to EC2
SSH into your Ubuntu server and run the following commands:

```bash
mkdir -p ~/apps/convers
cd ~/apps/convers
nano docker-compose.yml
```

Paste the following configuration (replace `<YOUR-GITHUB-USERNAME>` with your actual username):

```yaml
version: '3.8'

services:
  english-companion:
    image: ghcr.io/<YOUR-GITHUB-USERNAME>/convers:latest
    container_name: english-companion-app
    restart: always
    ports:
      - "3000:3000"
    environment:
      # Use docker host IP if your DB is exposed to host, e.g., 172.17.0.1
      - DATABASE_URL=postgresql://user:pass@172.17.0.1:5432/convers
      - OPENROUTER_API_KEY=your_api_key
```

Save the file and run:
```bash
docker-compose pull
docker-compose up -d
```

Your app will be running on port 3000!
