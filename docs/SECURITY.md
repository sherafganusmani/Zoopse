# Security Model

- Passwords are stored as bcrypt hashes.
- Access and refresh tokens are signed with separate secrets.
- RBAC uses role and permission contracts shared by the web and API.
- Protected routes require JWT verification and permission checks.
- Helmet, CORS, JSON size limits, and rate limiting are enabled by default.
- SQL access uses Drizzle query builders or parameterized `pg` queries.
- Audit, activity, attendance change, session, and support-ticket tables are part of the schema.

## Production Requirements

- Use 64+ character JWT secrets stored only in platform secrets.
- Enforce HTTPS and secure cookies when refresh-token rotation is moved to HTTP-only cookies.
- Encrypt sensitive settings such as SMTP, SMS, WhatsApp, payment, and storage credentials.
- Enable database SSL on Neon.
- Keep audit logs immutable through application policy and database permissions.
