const request = require("supertest");
const app = require("../../src/app");
describe("GET /fragments/:id", () => {
    test("unauthenticated requests are denied", () => request(app).get("/v1/fragments/id").expect(401));

    test("incorrect credentials are denied", () => request(app).get("/v1/fragments/id").auth("invalid@email.com", "incorrect_password").expect(401));

    test("get fragment requests with invalid id are denied", async () => {
        const response = await request(app)
            .get("/v1/fragments/not-existed-id")
            .auth("user1@email.com", "password1");

        expect(response.statusCode).toBe(404);
    });

    test("get fragment requests with valid id and no extension should return the original data", async () => {
        let response;
        let id;
        response = await request(app)
            .post("/v1/fragments")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world");
        id = response.body.fragment.id;
        response = await request(app)
            .get(`/v1/fragments/${id}`)
            .auth("user1@email.com", "password1");
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("text/plain");
        expect(response.text).toBe("Hello the world");
    });

    test("get fragment requests with valid id and has the extension to be specified should return the data in the desire format", async () => {
        let response;
        let id;
        response = await request(app)
            .post("/v1/fragments")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world");
        id = response.body.fragment.id;
        response = await request(app)
            .get(`/v1/fragments/${id}.md`)
            .auth("user1@email.com", "password1");
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("text/markdown");
        expect(response.text).toBe("Hello the world");
    });

    test("get fragment requests with valid id but invalid extension should be rejected", async () => {
        let response;
        let id;
        response = await request(app)
            .post("/v1/fragments")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world");
        id = response.body.fragment.id;
        response = await request(app)
            .get(`/v1/fragments/${id}.png`)
            .auth("user1@email.com", "password1");
        expect(response.statusCode).toBe(415);
    });
});