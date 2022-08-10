const {createErrorResponse, createSuccessResponse} = require("../../response");
const crypto = require("crypto");
const {Fragment} = require("../../model/fragment");
const logger = require("../../logger");

module.exports = async (req, res) => {
    if (!Buffer.isBuffer(req.file.buffer)) {
        logger.error({}, "The content type is not supported");
        res.status(415).json(createErrorResponse(415, "The content type is not supported"));
    }
    else {
        try {
            const id = req.params.id;
            const ownerId = crypto.createHash("sha256").update(req.user).digest("base64");
            const metadata = await Fragment.byId(ownerId, id);
            const fragment = new Fragment({...metadata});
            if (req.file.mimetype !== fragment.mimeType) {
                logger.error({}, "The content type can not be changed once created");
                res.status(400).json(createErrorResponse(400, "The content type can not be changed once created"));
            }
            else {
                await fragment.setData(req.file.buffer);
                await fragment.save();
                res.location(`${process.env.API_URL}:${process.env.PORT}/v1/fragments/${fragment.id}`);
                res.status(200).json(createSuccessResponse({fragment}));
            }
        } catch (e) {
            logger.error({e}, "The fragment can not be found");
            res.status(404)
                .json(createErrorResponse(404, "The fragment can not be found"));
        }
    }
};