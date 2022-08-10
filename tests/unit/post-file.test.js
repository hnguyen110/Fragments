const request = require("supertest");

const app = require("../../src/app");

describe("POST /v1/fragments/file", () => {
    test("unauthenticated requests are denied", () => request(app).post("/v1/fragments/file").expect(401));

    test("incorrect credentials are denied", () =>
        request(app).post("/v1/fragments/file").auth("invalid@email.com", "incorrect_password").expect(401));

    test("invalid content type requests are denied", async () => {
        const response = await request(app)
            .post("/v1/fragments/file")
            .auth("user1@email.com", "password1")
            .attach("file", __dirname + "/../invalid-file");
        expect(response.statusCode).toBe(415);
    });

    test("valid requests", async () => {
        const response = await request(app)
            .post("/v1/fragments/file")
            .auth("user1@email.com", "password1")
            .attach("file", __dirname + "/../valid-file.md");
        expect(response.statusCode).toBe(201);
    });
});