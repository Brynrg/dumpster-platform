import { POST } from "./route";

describe("POST /api/lead", () => {
  it("should return 400 if JSON payload is invalid", async () => {
    // A request with invalid JSON body
    const request = new Request("http://localhost/api/lead", {
      method: "POST",
      body: "invalid-json",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: "Invalid JSON payload." });
  });
});
