const crypto = require("crypto");
const {Fragment} = require("../../model/fragment");
const {createErrorResponse, createSuccessResponse} = require("../../response");
const logger = require("../../logger");

module.exports = async (req, res) => {
    const id = req.params.id;
    const ownerId = crypto.createHash("sha256").update(req.user).digest("base64");
    try {
        await Fragment.byId(ownerId, id);
        await Fragment.delete(ownerId, id);
        res.status(200).json(createSuccessResponse());
    } catch (e) {
        logger.error({e}, "The fragment can not be found");
        res.status(404)
            .json(createErrorResponse(404, "The fragment can not be found"));
    }
};