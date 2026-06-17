import { POST } from "./route";

describe("POST /api/admin/login", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return 500 if ADMIN_TOKEN is not configured", async () => {
    delete process.env.ADMIN_TOKEN;

    const request = new Request("http://localhost/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ token: "test" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "ADMIN_TOKEN is not configured." });
  });

  it("should return 400 if JSON payload is invalid", async () => {
    process.env.ADMIN_TOKEN = "valid-token";

    const request = new Request("http://localhost/api/admin/login", {
      method: "POST",
      body: "invalid-json",
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid JSON payload." });
  });

  it("should return 401 if token is missing", async () => {
    process.env.ADMIN_TOKEN = "valid-token";

    const request = new Request("http://localhost/api/admin/login", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid admin token." });
  });

  it("should return 401 if token is invalid", async () => {
    process.env.ADMIN_TOKEN = "valid-token";

    const request = new Request("http://localhost/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ token: "invalid-token" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid admin token." });
  });

  it("should return 200 and set cookie if token is valid", async () => {
    process.env.ADMIN_TOKEN = "valid-token";
    process.env.NODE_ENV = "development";

    const request = new Request("http://localhost/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ token: "valid-token" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true });

    const cookieHeader = response.headers.get("set-cookie");
    expect(cookieHeader).toContain("admin=1");
    expect(cookieHeader).toContain("HttpOnly");
    expect(cookieHeader).toContain("SameSite=lax");
    expect(cookieHeader).toContain("Path=/");
    expect(cookieHeader).toContain("Max-Age=28800");
  });
});
