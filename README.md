# Job Application Tracker REST API

A robust, enterprise-grade backend API built with **Node.js, Express, and PostgreSQL** to help job seekers track their job applications, organize interview stages, and generate AI-tailored cover letters using the **OpenAI API**.

---

## 🚀 Tech Stack
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express
* **Database:** PostgreSQL
* **ORM:** Prisma ORM
* **Authentication:** JSON Web Tokens (JWT) & bcrypt (password hashing)
* **Validation:** Zod
* **Rate Limiting:** express-rate-limit (Stricter limiting on AI & Auth routes)
* **AI Integration:** OpenAI API (GPT-4o-mini)
* **Testing:** Jest & Supertest

---

## 📂 Project Structure
```
job-tracker-api/
├── prisma/
│   └── schema.prisma    # Database Schema Models & Enums
├── src/
│   ├── config/          # Configurations (db.js, openai.js)
│   ├── controllers/     # HTTP Controller Layer (Express Handlers)
│   ├── services/        # Business Logic & Data Access Layer (Prisma queries)
│   ├── middlewares/     # Middlewares (protect, validate, rateLimit, errorHandler)
│   ├── routes/          # Express Routers
│   ├── schemas/         # Zod Request Validation Schemas
│   ├── utils/           # Utilities (response.js, asynchandler.js)
│   └── app.js           # Express App Configuration
├── index.js             # App Entry Point (Server listener)
├── babel.config.json    # Babel config for Jest ESM support
├── package.json
└── README.md
```

---

## 📊 Database Schema (Prisma)
The database has 3 relational models:

### 1. `User`
Tracks authenticated job-seekers:
* `id` (Int, PK, autoincrement)
* `name` (String)
* `email` (String, Unique)
* `password` (String, hashed)
* `avatarUrl` (String, Nullable)
* `createdAt` / `updatedAt`

### 2. `Application`
Tracks job applications (isolated per user):
* `id` (Int, PK, autoincrement)
* `authorId` (Int, FK -> User)
* `companyName` (String)
* `position` (String)
* `jobUrl` (String, Nullable)
* `status` (Enum: `WISHLIST`, `APPLIED`, `INTERVIEWING`, `OFFERED`, `REJECTED`, `ACCEPTED`)
* `minSalary` / `maxSalary` (Int, Nullable)
* `location` (String, Nullable)
* `notes` (String, Nullable)
* `appliedAt` (DateTime, Nullable)

### 3. `InterviewStage`
Tracks stages for individual applications:
* `id` (Int, PK, autoincrement)
* `applicationId` (Int, FK -> Application)
* `type` (Enum: `PHONE_SCREEN`, `TECHNICAL`, `HR`, `ASSIGNMENT`, `FINAL`, `OFFER`)
* `result` (Enum: `PENDING`, `PASSED`, `FAILED`, `CANCELLED`)
* `scheduledAt` / `completedAt` (DateTime, Nullable)
* `notes` (String, Nullable)

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
* `POST /register` - Registers a new user & returns user details + JWT.
* `POST /login` - Authenticates user & returns JWT (Rate-limited to 10 requests/15 mins).
* `GET /me` - Fetches the currently logged-in user profile (Requires Token).
* `PATCH /me` - Updates the current user's profile (Requires Token).

### 💼 Applications (`/api/applications`)
*All endpoints below require a valid `Bearer` token.*
* `POST /` - Creates a new application (Validates salary: `maxSalary >= minSalary`).
* `GET /` - Lists user applications (Supports query filtering: `?status=APPLIED` & `?search=google`).
* `GET /stats` - Returns stats summary (`total`, `thisWeek`, and `byStatus` counts).
* `GET /:id` - Fetches details of a single application (Checks ownership).
* `PATCH /:id` - Updates application details (Checks ownership).
* `PATCH /:id/status` - Updates status only (Checks ownership).
* `DELETE /:id` - Deletes application (Checks ownership - Returns `204 No Content`).
* `POST /:id/cover-letter` - Generates a tailored AI cover letter (Strictly limited to 5 requests/hour per IP).

---

## ⚙️ Configuration & Setup

### 1. Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
PORT=3000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/job_tracker?schema=public
JWT_KEY=your_secret_jwt_sign_key
OPENAI_API_KEY=your_openai_api_key
```

### 2. Local Setup
```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Run in development mode (with nodemon)
npm run dev

# Run unit tests (uses Jest & Babel)
npm run test
```

---

## 🛡️ Core Architectural Rules Followed
* **Strict Separation of Concerns:** Controllers handle HTTP codes/responses; Services handle data retrieval/Prisma logic. Controllers never import Prisma directly.
* **Implicit Data Isolation:** All list queries filter by `authorId: req.user.id`.
* **Explicit Authorization:** Single-record handlers check if `record.authorId === req.user.id` at the service layer, returning specific error codes like `NOT_FOUND` and `FORBIDDEN`.
* **Safe Input Processing:** Request body parsing middleware (`validate`) parses and strips out unexpected body variables using Zod schemas.
