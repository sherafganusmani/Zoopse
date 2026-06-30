# API

Base path: `/api/v1`

All protected endpoints require `Authorization: Bearer <accessToken>`.

## Core Endpoints

- `POST /auth/login`: Authenticates a user and returns access and refresh tokens.
- `GET /dashboard/overview`: Returns metrics, attendance trends, department performance, and notifications.
- `GET /attendance/sessions`: Lists attendance sessions with pagination.
- `POST /attendance/sessions`: Creates a lecture or lab attendance session.
- `POST /attendance/sessions/:sessionId/records`: Upserts attendance marks for a session.
- `POST /attendance/sessions/:sessionId/lock`: Locks a session to prevent changes.
- `GET /directory/departments`: Lists college departments.
- `GET /directory/students`: Searches students with pagination.
- `GET /reports/defaulters?threshold=75`: Returns students below the attendance threshold.
- `GET /reports/attendance-trend`: Returns date-wise attendance percentages.
- `GET /settings`: Lists settings.
- `PUT /settings/:key`: Upserts a college or global setting.

Swagger UI is mounted at `/api/docs`.
