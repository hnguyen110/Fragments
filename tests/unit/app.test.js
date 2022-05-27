const request = require("supertest");

const app = require("../../src/app");

describe("Not Found Response (404)", () => {
    test("should return HTTP 404 response", async () => {
        const res = await request(app).get("/not-found");
        expect(res.statusCode).toBe(404);
    });
});