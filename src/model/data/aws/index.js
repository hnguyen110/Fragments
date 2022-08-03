const s3Client = require("./s3Client");
const ddbDocClient = require("./ddbDocClient");
const {PutObjectCommand, GetObjectCommand, DeleteObjectCommand} = require("@aws-sdk/client-s3");
const logger = require("../../../logger");
const {PutCommand, GetCommand, DeleteCommand} = require("@aws-sdk/lib-dynamodb");
const {QueryCommand} = require("@aws-sdk/client-dynamodb");

async function writeFragment(fragment) {
    const params = {
        TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
        Item: fragment,
    };

    const command = new PutCommand(params);

    try {
        return ddbDocClient.send(command);
    } catch (err) {
        logger.warn({err, params, fragment}, "error writing fragment to DynamoDB");
        throw err;
    }
}

async function readFragment(ownerId, id) {
    const params = {
        TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
        Key: {ownerId, id},
    };

    const command = new GetCommand(params);

    try {
        const data = await ddbDocClient.send(command);
        return data?.Item;
    } catch (err) {
        logger.warn({err, params}, "error reading fragment from DynamoDB");
        throw err;
    }
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
    const params = {
        TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
        KeyConditionExpression: "ownerId = :ownerId",
        ExpressionAttributeValues: {
            ":ownerId": {S: ownerId},
        },
    };

    if (!expand) {
        params.ProjectionExpression = "id";
    }

    const command = new QueryCommand(params);

    try {
        const data = await ddbDocClient.send(command);
        return !expand
            ? data?.Items.map((item) => item.id.S)
            : data?.Items.map((item) => {
                return {
                    id: item.id.S,
                    ownerId: item.ownerId.S,
                    type: item.type.S,
                    size: item.size.N,
                    updated: item.updated.S,
                    created: item.created.S
                }
            });
    } catch (err) {
        logger.error({err}, "error getting all fragments for user from DynamoDB");
        throw err;
    }
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

async function deleteFragmentMetadata(ownerId, id) {
    const params = {
        TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
        Key: {
            ownerId, id
        },
    };

    const command = new DeleteCommand(params);

    try {
        return ddbDocClient.send(command);
    } catch (error) {
        logger.warn({error, params}, "error deleting fragment from DynamoDB");
        throw error;
    }
}

async function deleteFragment(ownerId, id) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${ownerId}/${id}`,
    };

    const command = new DeleteObjectCommand(params);

    try {
        await deleteFragmentMetadata(ownerId, id);
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
