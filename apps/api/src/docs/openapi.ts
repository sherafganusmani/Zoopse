export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Campus Attendance Suite API",
    version: "1.0.0"
  },
  servers: [{ url: "/api/v1" }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/auth/login": {
      post: {
        summary: "Authenticate a user and issue JWT tokens",
        security: [],
        responses: { "200": { description: "Authenticated" } }
      }
    },
    "/dashboard/overview": {
      get: {
        summary: "Return role-aware dashboard analytics",
        responses: { "200": { description: "Dashboard overview" } }
      }
    },
    "/attendance/sessions": {
      get: { summary: "List attendance sessions", responses: { "200": { description: "Sessions" } } },
      post: { summary: "Create attendance session", responses: { "201": { description: "Session created" } } }
    },
    "/reports/defaulters": {
      get: { summary: "Generate defaulter list using configurable threshold", responses: { "200": { description: "Defaulters" } } }
    }
  }
};
