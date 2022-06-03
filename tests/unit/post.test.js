const request = require("supertest");

const app = require("../../src/app");

describe("POST /v1/fragments", () => {
    test("unauthenticated requests are denied", () => request(app).post("/v1/fragments").expect(401));

    test("incorrect credentials are denied", () =>
        request(app).post("/v1/fragments").auth("invalid@email.com", "incorrect_password").expect(401));

    test("invalid content type requests are denied", async () => {
        const response = await request(app)
            .post("/v1/fragments")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/yaml")
            .send("Hello the world");
        expect(response.statusCode).toBe(415);
    });

    test("valid requests", async () => {
        const response = await request(app)
            .post("/v1/fragments")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world");
        expect(response.statusCode).toBe(201);
        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.body.status).toBe("ok");
        expect(typeof response.body.fragment.id).toBe("string");
        expect(typeof response.body.fragment.ownerId).toBe("string");
        expect(typeof response.body.fragment.created).toBe("string");
        expect(typeof response.body.fragment.updated).toBe("string");
        expect(typeof response.body.fragment.type).toBe("string");
        expect(typeof response.body.fragment.size).toBe("number");
        expect(response.body.fragment.type).toBe("text/plain");
        expect(Object.is(response.body.fragment.created, response.body.fragment.updated)).toBe(true);
        expect(Date.parse(response.body.fragment.created)).not.toBeNaN();
        expect(Date.parse(response.body.fragment.updated)).not.toBeNaN();
        expect(response.headers["location"]).toBe(`${process.env.API_URL}:${process.env.PORT}/v1/fragments/${response.body.fragment.id}`);
    });
});