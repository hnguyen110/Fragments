const {createErrorResponse, createSuccessResponse} = require("../../response");
const contentType = require("content-type");
const crypto = require("crypto");
const {Fragment} = require("../../model/fragment");

module.exports = async (req, res) => {
    if (req.body === {})
        res.status(415).json(createErrorResponse(415, "The content type is not supported"));
    const id = req.params.id;
    const ownerId = crypto.createHash("sha256").update(req.user).digest("base64");
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment)
        res.status(404)
            .json(createErrorResponse(404, "The fragment can not be found"));
    const {type} = contentType.parse(req);
    if (type !== fragment.mimeType)
        res.status(400).json(createErrorResponse(400, "The content type can not be changed once created"));
    await fragment.setData(req.body);
    await fragment.save();
    res.location(`${process.env.API_URL}:${process.env.PORT}/v1/fragments/${fragment.id}`);
    res.status(200).json(createSuccessResponse({fragment}));
};