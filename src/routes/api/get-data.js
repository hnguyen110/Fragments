const crypto = require("crypto");
const sharp = require("sharp");
const mimeTypes = require("mime-types");
const {Fragment} = require("../../model/fragment");
const {createErrorResponse} = require("../../response");
const logger = require("../../logger");

module.exports = async (req, res) => {
    const [id, extension] = req.params.id.split(".");
    const ownerId = crypto.createHash("sha256").update(req.user).digest("base64");
    try {
        const metadata = await Fragment.byId(ownerId, id);
        const fragment = new Fragment({...metadata});
        if (!extension) {
            const rawData = await fragment.getData();
            if (fragment?.mimeType.startsWith("image")) {
                const image = await sharp(rawData).toFormat("png").toBuffer();
                res.set("Content-Type", fragment?.mimeType);
                res.status(200).send(image);
            }
            else {
                res.set("Content-Type", fragment?.mimeType);
                res.status(200).send(rawData);
            }
        }
        else {
            if (!fragment.isConvertible(extension)) {
                logger.error(
                    {},
                    "The fragment can not be converted or the given extension is not supported"
                );
                res
                    .status(415)
                    .json(
                        createErrorResponse(
                            415,
                            "The fragment can not be converted or the given extension is not supported"
                        )
                    );
            }
            else {
                res.set("Content-Type", mimeTypes.lookup(extension));
                res.status(200).send(await fragment.getData());
            }
        }
    } catch (e) {
        logger.error({e}, "The fragment can not be found");
        res.status(404).json(createErrorResponse(404, "The fragment can not be found"));
    }
};
