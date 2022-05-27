const express = require("express");
const {authenticate} = require("../authorization");

const {version, author} = require("../../package.json");

const router = express.Router();

router.use(`/v1`, authenticate(), require("./api"));

router.get("/", (req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.status(200).json({
        status: "ok",
        author,
        githubUrl: "git@github.com:hnguyen110/Fragments.git",
        version,
    });
});

module.exports = router;