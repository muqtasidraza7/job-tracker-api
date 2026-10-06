export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Job Application Tracker & AI Career Copilot API",
    version: "1.0.0",
    description: `A production-ready, high-performance RESTful API for managing job applications, tracking interview lifecycles, generating AI cover letters, and monitoring career analytics.

### Features
- **JWT Authentication:** Secure user registration, authentication, profile management, and password hashing with bcrypt.
- **Job Application Lifecycle:** Full CRUD operations with stages (\`WISHLIST\` → \`APPLIED\` → \`INTERVIEWING\` → \`OFFERED\` → \`ACCEPTED\` / \`REJECTED\`).
- **Interview Stage Tracking:** Multi-round interview management with automated state transitions.
- **AI-Powered Cover Letters:** OpenAI GPT-4o-mini integration for contextual cover letter generation.
- **High Performance & Multi-Tier Caching:** Redis caching for sub-15ms queries and automatic cache invalidation on mutations.
- **Distributed Rate Limiting:** Multi-tiered rate limiting backed by Redis.
- **Enterprise Error Handling:** Standardized error envelopes and database constraint mapping.`,
    contact: {
      name: "Muqtasid Raza",
      url: "https://github.com/muqtasidraza7/job-tracker-api",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
    {
      url: "https://job-tracker-api-puce.vercel.app",
      description: "Live Production Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <token>",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "John Doe" },
          email: { type: "string", format: "email", example: "john@example.com" },
          avatarUrl: { type: "string", nullable: true, example: "https://example.com/avatar.jpg" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ApplicationStatus: {
        type: "string",
        enum: ["WISHLIST", "APPLIED", "INTERVIEWING", "OFFERED", "REJECTED", "ACCEPTED"],
        example: "APPLIED",
      },
      StageType: {
        type: "string",
        enum: ["PHONE_SCREEN", "TECHNICAL", "HR", "ASSIGNMENT", "FINAL", "OFFER"],
        example: "TECHNICAL",
      },
      StageResult: {
        type: "string",
        enum: ["PENDING", "PASSED", "FAILED", "CANCELLED"],
        example: "PENDING",
      },
      InterviewStage: {
        type: "object",
        properties: {
          id: { type: "integer", example: 10 },
          applicationId: { type: "integer", example: 1 },
          type: { $ref: "#/components/schemas/StageType" },
          scheduledAt: { type: "string", format: "date-time", nullable: true },
          completedAt: { type: "string", format: "date-time", nullable: true },
          notes: { type: "string", nullable: true, example: "Focus on System Design and Node.js event loop" },
          result: { $ref: "#/components/schemas/StageResult" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Application: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          authorId: { type: "integer", example: 42 },
          companyName: { type: "string", example: "Google" },
          position: { type: "string", example: "Senior Backend Engineer" },
          jobUrl: { type: "string", nullable: true, example: "https://careers.google.com/jobs/123" },
          status: { $ref: "#/components/schemas/ApplicationStatus" },
          minSalary: { type: "integer", nullable: true, example: 120000 },
          maxSalary: { type: "integer", nullable: true, example: 160000 },
          location: { type: "string", nullable: true, example: "Remote, US" },
          notes: { type: "string", nullable: true, example: "Referred by senior engineer" },
          appliedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          stages: {
            type: "array",
            items: { $ref: "#/components/schemas/InterviewStage" },
          },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          total: { type: "integer", example: 25 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          totalPages: { type: "integer", example: 3 },
          hasNextPage: { type: "boolean", example: true },
          hasPrevPage: { type: "boolean", example: false },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              message: { type: "string", example: "Application not found" },
              details: { type: "array", items: { type: "object" }, nullable: true },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Muqtasid Raza" },
                  email: { type: "string", format: "email", example: "muqtasid@example.com" },
                  password: { type: "string", minLength: 8, example: "SecurePass123!" },
                  avatarUrl: { type: "string", example: "https://github.com/muqtasidraza7.png" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully, returns JWT token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..." },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Validation failure", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          409: { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "muqtasid@example.com" },
                  password: { type: "string", example: "SecurePass123!" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful, returns JWT token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..." },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          429: { description: "Too many login attempts", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user profile",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "User profile details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized / Missing Token", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      patch: {
        tags: ["Auth"],
        summary: "Update current authenticated user profile",
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Updated Name" },
                  email: { type: "string", format: "email", example: "newemail@example.com" },
                  password: { type: "string", minLength: 8, example: "NewSecurePass123!" },
                  avatarUrl: { type: "string", example: "https://example.com/avatar.png" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated successfully",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, data: { $ref: "#/components/schemas/User" } } } } },
          },
          400: { description: "Validation failure", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          409: { description: "Email already taken", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/applications": {
      get: {
        tags: ["Applications"],
        summary: "List user applications (Paginated, Searchable, Filterable)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { $ref: "#/components/schemas/ApplicationStatus" }, description: "Filter by status" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Search by company name or position" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
          { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 50 }, description: "Items per page" },
        ],
        responses: {
          200: {
            description: "Paginated list of applications",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Application" },
                    },
                    meta: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      post: {
        tags: ["Applications"],
        summary: "Create a new job application",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["companyName", "position"],
                properties: {
                  companyName: { type: "string", example: "Stripe" },
                  position: { type: "string", example: "Full Stack Engineer" },
                  jobUrl: { type: "string", example: "https://stripe.com/jobs/123" },
                  status: { $ref: "#/components/schemas/ApplicationStatus" },
                  minSalary: { type: "integer", example: 130000 },
                  maxSalary: { type: "integer", example: 170000 },
                  location: { type: "string", example: "Remote / San Francisco" },
                  notes: { type: "string", example: "Focus on Node.js, distributed databases, payments" },
                  appliedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Application created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Application" },
                  },
                },
              },
            },
          },
          400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/api/applications/stats": {
      get: {
        tags: ["Applications"],
        summary: "Get aggregate dashboard metrics and analytics (cached)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Analytics statistics summary",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        total: { type: "integer", example: 34 },
                        thisWeek: { type: "integer", example: 5 },
                        byStatus: {
                          type: "object",
                          example: {
                            WISHLIST: 4,
                            APPLIED: 18,
                            INTERVIEWING: 7,
                            OFFERED: 2,
                            REJECTED: 3,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/applications/{id}": {
      get: {
        tags: ["Applications"],
        summary: "Get single application details by ID",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Application details", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, data: { $ref: "#/components/schemas/Application" } } } } } },
          403: { description: "Forbidden - Not your application" },
          404: { description: "Application not found" },
        },
      },
      patch: {
        tags: ["Applications"],
        summary: "Update application details",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  companyName: { type: "string" },
                  position: { type: "string" },
                  jobUrl: { type: "string" },
                  status: { $ref: "#/components/schemas/ApplicationStatus" },
                  minSalary: { type: "integer" },
                  maxSalary: { type: "integer" },
                  location: { type: "string" },
                  notes: { type: "string" },
                  appliedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Updated application", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, data: { $ref: "#/components/schemas/Application" } } } } } },
          403: { description: "Forbidden" },
          404: { description: "Application not found" },
        },
      },
      delete: {
        tags: ["Applications"],
        summary: "Delete an application and its stages",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          204: { description: "Application deleted successfully (No Content)" },
          403: { description: "Forbidden" },
          404: { description: "Application not found" },
        },
      },
    },
    "/api/applications/{id}/status": {
      patch: {
        tags: ["Applications"],
        summary: "Quickly update application status",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { $ref: "#/components/schemas/ApplicationStatus" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Updated application", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, data: { $ref: "#/components/schemas/Application" } } } } } },
        },
      },
    },
    "/api/applications/{id}/cover-letter": {
      post: {
        tags: ["Applications"],
        summary: "Generate an AI tailored cover letter using OpenAI GPT-4o-mini",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "Generated AI cover letter",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        coverLetter: { type: "string", example: "Dear Hiring Team at Stripe,\n\nI am writing to express my enthusiastic interest in the Full Stack Engineer role..." },
                      },
                    },
                  },
                },
              },
            },
          },
          429: { description: "AI rate limit exceeded (5 requests/hour)" },
        },
      },
    },
    "/api/applications/{id}/stages": {
      get: {
        tags: ["Interview Stages"],
        summary: "List all interview stages for a given application",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "List of interview stages",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/InterviewStage" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Interview Stages"],
        summary: "Add an interview round (auto-advances APPLIED → INTERVIEWING on first round)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["type"],
                properties: {
                  type: { $ref: "#/components/schemas/StageType" },
                  scheduledAt: { type: "string", format: "date-time", example: "2026-10-15T14:00:00.000Z" },
                  completedAt: { type: "string", format: "date-time" },
                  notes: { type: "string", example: "Live coding session on Tree & Graph Algorithms" },
                  result: { $ref: "#/components/schemas/StageResult", default: "PENDING" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Stage created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/InterviewStage" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/applications/{id}/stages/{stageId}": {
      patch: {
        tags: ["Interview Stages"],
        summary: "Update interview stage result, notes, or schedule",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
          { name: "stageId", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  type: { $ref: "#/components/schemas/StageType" },
                  scheduledAt: { type: "string", format: "date-time" },
                  completedAt: { type: "string", format: "date-time" },
                  notes: { type: "string" },
                  result: { $ref: "#/components/schemas/StageResult" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Updated stage", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, data: { $ref: "#/components/schemas/InterviewStage" } } } } } },
        },
      },
      delete: {
        tags: ["Interview Stages"],
        summary: "Delete an interview stage",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
          { name: "stageId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          204: { description: "Stage deleted successfully" },
        },
      },
    },
  },
}
