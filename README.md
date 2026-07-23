# Job Application Tracker API

A RESTful backend API for tracking job applications, interview stages, and generating AI-powered cover letters.

**Live URL:** [https://job-tracker-api-puce.vercel.app](https://job-tracker-api-puce.vercel.app)  
**GitHub:** [https://github.com/muqtasidraza7/job-tracker-api](https://github.com/muqtasidraza7/job-tracker-api)

---

## Tech Stack
- **Runtime:** Node.js with Express.js (ES Modules)
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** JWT with bcrypt password hashing
- **Validation:** Zod schema validation
- **AI Integration:** OpenAI GPT-4o-mini for cover letter generation
- **Security:** Helmet, CORS, express-rate-limit
- **Deployment:** Vercel (API) + Railway (PostgreSQL)

---

## Features
- **JWT Authentication:** Secure user registration, login, profile retrieval, and settings updates.
- **CRUD Operations:** Full Create, Read, Update, and Delete endpoints for job applications with rigorous ownership checks.
- **Status Lifecycle Tracking:** Track application states seamlessly: `WISHLIST` → `APPLIED` → `INTERVIEWING` → `OFFERED` → `ACCEPTED`/`REJECTED`.
- **Interview Stage Management:** Add, list, edit, and delete multiple interview rounds (Phone Screen, Technical, HR, etc.) with automatic overall status transitions (first interview scheduled on an `APPLIED` job automatically moves it to `INTERVIEWING`).
- **Dashboard Stats:** Aggregate analytics returning total applications count, applications added in the current week, and breakdown of applications by status.
- **AI Cover Letter Generator:** Integrates with OpenAI to create customized cover letters tailored to the specific position, company details, and notes.
- **Filtering & Search:** Search jobs by company name or position, and filter by current application status.
- **Pagination:** Consistent offset-based pagination returning page data and metadata (`total`, `page`, `limit`, `totalPages`) for application lists.
- **Rate Limiting Protection:** Implements multi-tier limiting to secure resources:
  * Global API Limiter: 100 requests per 15 minutes per IP
  * Auth Limiter: 10 login attempts per 15 minutes per IP
  * AI Limiter: 5 cover letter requests per hour per IP

---

## API Endpoints

### Authentication
| Method | Route              | Auth     | Description                    |
|--------|--------------------|----------|--------------------------------|
| POST   | `/api/auth/register` | Public   | Register new user, returns JWT |
| POST   | `/api/auth/login`    | Public   | Login, returns JWT             |
| GET    | `/api/auth/me`       | Required | Get logged-in user profile     |
| PATCH  | `/api/auth/me`       | Required | Update own profile             |

### Applications
| Method | Route                            | Auth     | Description                      |
|--------|----------------------------------|----------|----------------------------------|
| GET    | `/api/applications`                | Required | List own applications, paginated |
| POST   | `/api/applications`                | Required | Create new application           |
| GET    | `/api/applications/stats`          | Required | Dashboard stats                  |
| GET    | `/api/applications/:id`            | Required | Get single application           |
| PATCH  | `/api/applications/:id`            | Required | Update application               |
| PATCH  | `/api/applications/:id/status`     | Required | Update status only               |
| DELETE | `/api/applications/:id`            | Required | Delete application               |
| POST   | `/api/applications/:id/cover-letter` | Required | Generate AI cover letter         |

### Interview Stages
| Method | Route                                        | Auth     | Description          |
|--------|----------------------------------------------|----------|----------------------|
| GET    | `/api/applications/:id/stages`                 | Required | List stages          |
| POST   | `/api/applications/:id/stages`                 | Required | Add stage            |
| PATCH  | `/api/applications/:id/stages/:stageId`        | Required | Update stage         |
| DELETE | `/api/applications/:id/stages/:stageId`        | Required | Delete stage         |

---

## Local Setup

### 1. Clone the repository and install dependencies
```bash
git clone https://github.com/muqtasidraza7/job-tracker-api
cd job-tracker-api
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the project:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/job_tracker?schema=public
JWT_KEY=your_secret_key
OPENAI_API_KEY=your_openai_key
```

### 3. Initialize the Database & Run
```bash
# Run Prisma migrations
npx prisma migrate dev

# Run Prisma client generator
npx prisma generate

# Start the development server
npm run dev
```

---

## 📬 Postman Collection
To make testing easier for interviewers, a complete Postman collection is exported in the root directory: **`postman_collection.json`**. 

You can import this file directly into Postman to instantly load all endpoints, preset payloads, and headers.
