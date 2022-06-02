const crypto = require("crypto");
const contentType = require("content-type");
const {Fragment} = require("../../model/fragment");
const {createSuccessResponse, createErrorResponse} = require("../../response");

module.exports = async (req, res) => {
    if (req.body === {})
        res.status(415).json(createErrorResponse(415, "The content type is not supported"));
    const {type} = contentType.parse(req);
    const ownerId = crypto.createHash("sha256").update(req.user).digest("base64");
    const fragment = new Fragment({ownerId, type});
    await fragment.setData(req.body);
    await fragment.save();
    res.location(`${process.env.API_URL}:${process.env.PORT}/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({fragment}));
};