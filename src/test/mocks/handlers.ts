import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock Supabase auth endpoints
  http.post("*/auth/v1/token", () => {
    return HttpResponse.json({
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
      user: {
        id: "mock_user_id",
        email: "test@example.com",
        created_at: new Date().toISOString(),
      },
    });
  }),

  // Mock Supabase API endpoints
  http.get("*/rest/v1/*", () => {
    return HttpResponse.json([]);
  }),

  http.post("*/rest/v1/*", () => {
    return HttpResponse.json({ id: "mock_id" });
  }),

  http.patch("*/rest/v1/*", () => {
    return HttpResponse.json({ id: "mock_id" });
  }),

  http.delete("*/rest/v1/*", () => {
    return HttpResponse.json({});
  }),

  // Add more handlers as needed for your specific API endpoints
];
