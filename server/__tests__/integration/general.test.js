const request = require("supertest");
const api = require("../../src/api");

describe("General tests", () => {
  test.only("Test api health", async () => {
    const response = await request(api)
      .get("/api/")
      .send();

    expect(response.status).toBe(200);
  });

  test.only("Test invalid endpoint", async () => {
    const response = await request(api)
      .get("/api/invalid/")
      .send();

    expect(response.status).toBe(404);
  });
});
