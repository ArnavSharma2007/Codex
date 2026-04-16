DEV@Deakin: Codex - Final Project Scaffold

Features included:
- Notion-style notes (React Quill) with create/view/list and sharing by email.
- AI Assistant endpoint (mock) gated to premium users.
- Premium seed user (email: sharmag.arnav@gmail.com, password: Premium123!) via backend/scripts/seedPremiumUser.js
- Navbar with Deakin logo and branding "Dev@Deakin: Codex"
- Green / White / Black theme in frontend/src/styles.css

Local setup:
1. Backend:
   - cd backend
   - npm install
   - edit .env if needed (MONGO_URI, JWT_SECRET)
   - npm run seed   # creates premium user
   - npm run dev

2. Frontend:
   - cd frontend
   - npm install
   - npm run dev

Notes:
- The AI endpoint currently returns a mocked response; connect to your Netlify function or Gemini for live responses.
- Do not commit real secrets to public repos. Rotate keys if shared.
