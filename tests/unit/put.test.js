const request = require("supertest");
const app = require("../../src/app");
describe("PUT /fragments/:id", () => {
    test("unauthenticated requests are denied", () => request(app).put("/v1/fragments/id").expect(401));

    test("incorrect credentials are denied", () =>
        request(app).put("/v1/fragments/id").auth("invalid@email.com", "incorrect_password").expect(401));

    test("invalid fragment requests with invalid id are denied", async () => {
        const response = await request(app)
            .put("/v1/fragments/not-existed-id")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world");

        expect(response.statusCode).toBe(404);
    });

    test("invalid requests with not supported content type are denied", async () => {
        const response = await request(app)
            .put("/v1/fragments/not-existed-id")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/yaml")
            .send("Hello the world");

        expect(response.statusCode).toBe(415);
    });

    test("invalid requests with content type not match the record in the database are denied", async () => {
        let response;
        let id;
        response = await request(app)
            .post("/v1/fragments")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world");
        id = response.body.fragment.id;
        response = await request(app)
            .put(`/v1/fragments/${id}`)
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/markdown")
            .send("Hello the world again");
        expect(response.statusCode).toBe(400);
    });

    test("valid requests with the same content type and valid data should pass", async () => {
        let response;
        let id;
        response = await request(app)
            .post("/v1/fragments")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world");
        id = response.body.fragment.id;
        response = await request(app)
            .put(`/v1/fragments/${id}`)
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world again");
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.body.status).toBe("ok");
        expect(typeof response.body.fragment.id).toBe("string");
        expect(response.body.fragment.id).toBe(id);
        expect(typeof response.body.fragment.ownerId).toBe("string");
        expect(typeof response.body.fragment.created).toBe("string");
        expect(typeof response.body.fragment.updated).toBe("string");
        expect(typeof response.body.fragment.type).toBe("string");
        expect(typeof response.body.fragment.size).toBe("number");
        expect(response.body.fragment.type).toBe("text/plain");
        expect(Date.parse(response.body.fragment.created)).not.toBeNaN();
        expect(Date.parse(response.body.fragment.updated)).not.toBeNaN();
        expect(new Date(response.body.fragment.updated) >= new Date(response.body.fragment.created)).toBe(true);

    });
});