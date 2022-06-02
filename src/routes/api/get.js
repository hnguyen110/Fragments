const crypto = require("crypto");
const url = require('url');
const {Fragment} = require("../../model/fragment");
const {createSuccessResponse} = require("../../response");

module.exports = async (req, res) => {
    const query = url.parse(req.url,true).query;
    const ownerId = crypto.createHash("sha256").update(req.user).digest("base64");
    const fragments = await Fragment.byUser(ownerId, query?.expand === "1");
    res.status(200).json(createSuccessResponse({fragments}));
};