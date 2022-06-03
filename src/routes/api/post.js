const crypto = require("crypto");
const contentType = require("content-type");
const {Fragment} = require("../../model/fragment");
const {createSuccessResponse, createErrorResponse} = require("../../response");
const logger = require("../../logger");

module.exports = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        logger.error({}, "The content type is not supported");
        res.status(415).json(createErrorResponse(415, "The content type is not supported"));
    }
    else {
        const {type} = contentType.parse(req);
        const ownerId = crypto.createHash("sha256").update(req.user).digest("base64");
        const fragment = new Fragment({ownerId, type});
        await fragment.setData(req.body);
        await fragment.save();
        res.location(`${process.env.API_URL}:${process.env.PORT}/v1/fragments/${fragment.id}`);
        res.status(201).json(createSuccessResponse({fragment}));
    }
};