const express = require("express");
const contentType = require("content-type");
const multer = require("multer");
const {Fragment} = require("../../model/fragment");

const router = express.Router();
const uploader = multer({
    limits: {fileSize: 1024 * 1024 * 5},
    fileFilter: (request, file, callback) => {
        if (!Fragment.isSupportedType(file.mimetype)) {
            callback(null, false);
        }
        else {
            callback(null, true);
        }
    }
});

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
router.post("/fragments/file", uploader.single("file"), require("./post-file"));
router.put("/fragments/file/:id", uploader.single("file"), require("./put-file"));
router.post("/fragments", rawBody(), require("./post"));
router.put("/fragments/:id", rawBody(), require("./put"));
router.delete("/fragments/:id", require("./delete"));

module.exports = router;
