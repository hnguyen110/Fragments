const MemoryDB = require("../memory/memory-db");
const s3Client = require("./s3Client");
const {PutObjectCommand, GetObjectCommand, DeleteObjectCommand} = require("@aws-sdk/client-s3");
const logger = require("../../../logger");

const metadata = new MemoryDB();

function writeFragment(fragment) {
    return metadata.put(fragment.ownerId, fragment.id, fragment);
}

function readFragment(ownerId, id) {
    return metadata.get(ownerId, id);
}

async function writeFragmentData(ownerId, id, data) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${ownerId}/${id}`,
        Body: data,
    };

    const command = new PutObjectCommand(params);

    try {
        await s3Client.send(command);
    } catch (err) {
        const {Bucket, Key} = params;
        logger.error({err, Bucket, Key}, "Error uploading fragment data to S3");
        throw new Error("unable to upload fragment data");
    }
}

async function listFragments(ownerId, expand = false) {
    const fragments = await metadata.query(ownerId);

    if (expand || !fragments) {
        return fragments;
    }

    return fragments.map((fragment) => fragment.id);
}

const streamToBuffer = (stream) =>
    new Promise((resolve, reject) => {
        const chunks = [];

        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });

async function readFragmentData(ownerId, id) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${ownerId}/${id}`,
    };

    const command = new GetObjectCommand(params);

    try {
        const data = await s3Client.send(command);
        return streamToBuffer(data.Body);
    } catch (err) {
        const {Bucket, Key} = params;
        logger.error({err, Bucket, Key}, "Error streaming fragment data from S3");
        throw new Error("unable to read fragment data");
    }
}

async function deleteFragment(ownerId, id) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${ownerId}/${id}`,
    };

    const command = new DeleteObjectCommand(params);

    try {
        await s3Client.send(command);
    } catch (err) {
        const {Bucket, Key} = params;
        logger.error({err, Bucket, Key}, "Error deleting fragment data from S3");
        throw new Error("unable to delete fragment data");
    }
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
