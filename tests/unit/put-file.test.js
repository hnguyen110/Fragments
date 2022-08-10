const request = require("supertest");

const app = require("../../src/app");

describe("PUT /v1/fragments/file/:id", () => {
    test("unauthenticated requests are denied", () => request(app).put("/v1/fragments/file/id").expect(401));

    test("incorrect credentials are denied", () =>
        request(app).put("/v1/fragments/file/id").auth("invalid@email.com", "incorrect_password").expect(401));

    test("invalid fragment requests with invalid id are denied", async () => {
        const response = await request(app)
            .put("/v1/fragments/file/not-existed-id")
            .auth("user1@email.com", "password1")
            .attach("file", __dirname + "/../valid-file.md");

        expect(response.statusCode).toBe(404);
    });

    test("invalid requests with not supported content type are denied", async () => {
        const response = await request(app)
            .put("/v1/fragments/file/not-existed-id")
            .auth("user1@email.com", "password1")
            .attach("file", __dirname + "/../invalid-file");

        expect(response.statusCode).toBe(415);
    });

    test("invalid requests with content type not match the record in the database are denied", async () => {
        let response;
        let id;
        response = await request(app)
            .post("/v1/fragments/file")
            .auth("user1@email.com", "password1")
            .attach("file", __dirname + "/../valid-file.md");
        id = response.body.fragment.id;
        response = await request(app)
            .put(`/v1/fragments/file/${id}`)
            .auth("user1@email.com", "password1")
            .attach("file", __dirname + "/../valid-file.json");
        expect(response.statusCode).toBe(400);
    });

    test("valid requests with the same content type and valid data should pass", async () => {
        let response;
        let id;
        response = await request(app)
            .post("/v1/fragments/file")
            .auth("user1@email.com", "password1")
            .attach("file", __dirname + "/../valid-file.md");
        id = response.body.fragment.id;
        response = await request(app)
            .put(`/v1/fragments/file/${id}`)
            .auth("user1@email.com", "password1")
            .attach("file", __dirname + "/../valid-file.md");
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("ok");
    });
});