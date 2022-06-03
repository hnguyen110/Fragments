const request = require("supertest");
const app = require("../../src/app");

describe("DELETE /v1/fragments/:id", () => {
    test("unauthenticated requests are denied", () => request(app).post("/v1/fragments").expect(401));

    test("incorrect credentials are denied", () => request(app).post("/v1/fragments").auth("invalid@email.com", "incorrect_password").expect(401));

    test("delete the fragment with the invalid id are denied", async () => {
        const response = await request(app)
            .delete("/v1/fragments/not-existed-id")
            .auth("user1@email.com", "password1");

        expect(response.statusCode).toBe(404);
    });

    test("delete the fragment with the valid id", async () => {
        let response;
        let id;
        response = await request(app)
            .post("/v1/fragments")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world");
        id = response.body.fragment.id;
        response = await request(app).get("/v1/fragments").auth("user1@email.com", "password1");
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("ok");
        expect(Array.isArray(response.body.fragments)).toBe(true);
        expect(Object.is(JSON.stringify(response.body.fragments), JSON.stringify([id]))).toBe(true);
        response = await request(app)
            .delete(`/v1/fragments/${id}`)
            .auth("user1@email.com", "password1");
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("ok");
        response = await request(app).get("/v1/fragments").auth("user1@email.com", "password1");
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("ok");
        expect(Array.isArray(response.body.fragments)).toBe(true);
        expect(Object.is(JSON.stringify(response.body.fragments), JSON.stringify([]))).toBe(true);
    });
});