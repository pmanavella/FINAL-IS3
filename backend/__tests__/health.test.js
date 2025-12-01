const request = require("supertest");
const app = require("../index"); 

describe("Health", () => {
  it("GET /health -> 200", async () => {
    const res = await request(app).get("/health");
    expect([200, 204]).toContain(res.statusCode);
  });
});
