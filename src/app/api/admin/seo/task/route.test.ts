import type { NextRequest } from "next/server";
import { POST } from "./route";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/lib/adminSession";

const SECRET = "test-secret-at-least-32-characters-long!!";

describe("POST /api/admin/seo/task", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
  });
  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it("should return 401 if unauthorized", async () => {
    const mockRequest = {
      cookies: { get: () => undefined },
      json: async () => ({}),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Unauthorized." });
  });

  it("should return 400 if JSON payload is invalid", async () => {
    const token = await createAdminSession();
    const mockRequest = {
      cookies: {
        get: (name: string) =>
          name === ADMIN_SESSION_COOKIE ? { value: token } : undefined,
      },
      json: async () => {
        throw new Error("Unexpected end of JSON input");
      },
    } as unknown as NextRequest;

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid JSON payload." });
  });
});
