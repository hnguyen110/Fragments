const request = require("supertest");
const _ = require("lodash");

const app = require("../../src/app");

describe("GET /v1/fragments", () => {
    test("unauthenticated requests are denied", () => request(app).get("/v1/fragments").expect(401));

    test("incorrect credentials are denied", () =>
        request(app).get("/v1/fragments").auth("invalid@email.com", "incorrect_password").expect(401));

    test("authenticated users get an empty fragments array", async () => {
        const res = await request(app).get("/v1/fragments").auth("user1@email.com", "password1");
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("ok");
        expect(Array.isArray(res.body.fragments)).toBe(true);
        expect(Object.is(JSON.stringify(res.body.fragments), JSON.stringify([]))).toBe(true);
    });

    test("authenticated users get an fragments array (ids)", async () => {
        let response;
        const ids = [];

        response = await request(app)
            .post("/v1/fragments")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world");
        ids.push(response.body.fragment.id);

        response = await request(app)
            .post("/v1/fragments")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world");
        ids.push(response.body.fragment.id);

        response = await request(app)
            .post("/v1/fragments")
            .auth("user1@email.com", "password1")
            .set("Content-Type", "text/plain")
            .send("Hello the world");
        ids.push(response.body.fragment.id);

        response = await request(app).get("/v1/fragments").auth("user1@email.com", "password1");
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("ok");
        expect(Array.isArray(response.body.fragments)).toBe(true);
        expect(_.isEqual(ids.sort(), response.body.fragments.sort())).toBe(true);
        expect(response.body.fragments.length).toBe(3);
    });
});
