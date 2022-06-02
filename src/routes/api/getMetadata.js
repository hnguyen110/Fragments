const crypto = require("crypto");
const {Fragment} = require("../../model/fragment");
const {createErrorResponse, createSuccessResponse} = require("../../response");

module.exports = async (req, res) => {
    const id = req.params.id;
    const ownerId = crypto.createHash("sha256").update(req.user).digest("base64");
    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment)
        res.status(404)
            .json(createErrorResponse(404, "The fragment can not be found"));

    res.status(200).json(createSuccessResponse({fragment}));
};