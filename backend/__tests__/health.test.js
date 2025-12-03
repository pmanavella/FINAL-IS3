const request = require("supertest");
const app = require("../index"); 

describe("Health", () => {
  it("GET /health -> 200", async () => {
    const res = await request(app).get("/health");
    expect([200, 204]).toContain(res.statusCode);
  });
});

// backend/__tests__/health.test.js
test('suma tonta', ()=>{ expect(1+1).toBe(2) })
test('env test', ()=>{ process.env.NODE_ENV = 'test'; expect(process.env.NODE_ENV).toBe('test') })