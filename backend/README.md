# Bolt Website Backend

## Features
- User registration, login, and profile (user, doctor, therapist, admin)
- Homepage chatbot (public)
- Appointments (book, view, update, cancel)
- Speech emotion analysis (audio upload)
- Emotion history
- Report generation (with graph data, strengths/weaknesses, PDF download)
- Admin panel (user management, analytics)

## Tech Stack
- Node.js + Express
- MongoDB (Mongoose)
- JWT for authentication
- Multer for file uploads
- PDFKit for PDF report generation

## Setup Instructions

1. **Clone the repository and install dependencies:**
   ```sh
   cd backend
   npm install
   ```

2. **Create a `.env` file in the backend folder:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bolt_website
   JWT_SECRET=your_jwt_secret_here
   ```

3. **Start MongoDB locally** (or update `MONGODB_URI` for Atlas/cloud):
   ```sh
   mongod
   ```

4. **Run the backend server:**
   ```sh
   npm run dev
   ```

5. **API Endpoints:**
   - Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
   - Chatbot: `/api/chatbot/message`
   - Appointments: `/api/appointments`
   - Speech: `/api/speech/analyze`, `/api/speech/history`
   - Reports: `/api/reports/:id`, `/api/reports/:id/pdf`, `/api/reports/:id/graph`
   - Admin: `/api/admin/users`, `/api/admin/analytics`

6. **Uploads:**
   - Audio and report files are stored in the `/uploads` directory.

## Development
- Use `npm run dev` for development (nodemon enabled).
- All source code is in the `src/` directory.

---

For any issues, please contact the project maintainer. 