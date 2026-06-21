import { POST } from "./route";

describe("POST /api/admin/seo/task", () => {
  it("should return 401 if unauthorized", async () => {
    const mockRequest = {
      cookies: {
        get: () => undefined,
      },
      json: async () => ({}),
    } as any;

    const response = await POST(mockRequest);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Unauthorized." });
  });

  it("should return 400 if JSON payload is invalid", async () => {
    const mockRequest = {
      cookies: {
        get: (name: string) => {
          if (name === "admin") return { value: "1" };
          return undefined;
        },
      },
      json: async () => {
        throw new Error("Unexpected end of JSON input");
      },
    } as any;

    const response = await POST(mockRequest);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid JSON payload." });
  });
});
