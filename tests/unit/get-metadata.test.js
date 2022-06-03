const request = require("supertest");
const app = require("../../src/app");
describe("GET /fragments/:id/info", () => {
    test("unauthenticated requests are denied", () => request(app).get("/v1/fragments/id/info").expect(401));

    test("incorrect credentials are denied", () => request(app).get("/v1/fragments/id/info").auth("invalid@email.com", "incorrect_password").expect(401));

    test("get the fragment metadata with the invalid id are denied", async () => {
        const response = await request(app)
            .get("/v1/fragments/not-existed-id/info")
            .auth("user1@email.com", "password1");

        expect(response.statusCode).toBe(404);
    });

    test("get the fragment metadata with the valid id", async () => {
        let response;
        let id;
        response = await request(app)
            .post("/v1/fragments")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world");
        id = response.body.fragment.id;
        response = await request(app)
            .get(`/v1/fragments/${id}/info`)
            .auth("user1@email.com", "password1");
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toContain("application/json");
        expect(response.body.status).toBe("ok");
        expect(typeof response.body.fragment.id).toBe("string");
        expect(typeof response.body.fragment.ownerId).toBe("string");
        expect(typeof response.body.fragment.created).toBe("string");
        expect(typeof response.body.fragment.updated).toBe("string");
        expect(typeof response.body.fragment.type).toBe("string");
        expect(typeof response.body.fragment.size).toBe("number");
        expect(response.body.fragment.type).toBe("text/plain");
        expect(new Date(response.body.fragment.updated) >= new Date(response.body.fragment.created)).toBe(true);
        expect(Date.parse(response.body.fragment.created)).not.toBeNaN();
        expect(Date.parse(response.body.fragment.updated)).not.toBeNaN();
    });
});