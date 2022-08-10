const crypto = require("crypto");
const {Fragment} = require("../../model/fragment");
const {createSuccessResponse, createErrorResponse} = require("../../response");
const logger = require("../../logger");

module.exports = async (req, res) => {
    if (!Buffer.isBuffer(req.file.buffer)) {
        logger.error({}, "The content type is not supported");
        res.status(415).json(createErrorResponse(415, "The content type is not supported"));
    }
    else {
        try {
            const ownerId = crypto.createHash("sha256").update(req.user).digest("base64");
            const fragment = new Fragment({ownerId, type: req.file.mimetype});
            await fragment.setData(req.file.buffer);
            await fragment.save();
            res.location(`${process.env.API_URL}:${process.env.PORT}/v1/fragments/${fragment.id}`);
            res.status(201).json(createSuccessResponse({fragment}));
        } catch (e) {
            logger.error(e, "Internal server error");
            res.status(500).json(createErrorResponse(500, "Internal server error"));
        }
    }
};