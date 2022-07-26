const MemoryDB = require("./memory-db");

const data = new MemoryDB();
const metadata = new MemoryDB();

function writeFragment(fragment) {
    return metadata.put(fragment.ownerId, fragment.id, fragment);
}

function readFragment(ownerId, id) {
    return metadata.get(ownerId, id);
}

function writeFragmentData(ownerId, id, value) {
    return data.put(ownerId, id, value);
}

function readFragmentData(ownerId, id) {
    return data.get(ownerId, id);
}

async function listFragments(ownerId, expand = false) {
    const fragments = await metadata.query(ownerId);

    if (expand || !fragments) {
        return fragments;
    }

    return fragments.map((fragment) => fragment.id);
}

function deleteFragment(ownerId, id) {
    return Promise.all([
        metadata.del(ownerId, id),
        data.del(ownerId, id),
    ]);
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;