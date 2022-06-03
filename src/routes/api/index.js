const express = require("express");
const contentType = require("content-type");
const {Fragment} = require("../../model/fragment");

const router = express.Router();

const rawBody = () =>
    express.raw({
        inflate: true,
        limit: "5mb",
        type: (req) => {
            const {type} = contentType.parse(req);
            return Fragment.isSupportedType(type);
        },
    });

router.get("/fragments", require("./get"));
router.get("/fragments/:id", require("./get-data"));
router.get("/fragments/:id/info", require("./get-metadata"));
router.post("/fragments", rawBody(), require("./post"));
router.put("/fragments/:id", rawBody(), require("./put"));
router.delete("/fragments/:id", require("./delete"));

module.exports = router;
