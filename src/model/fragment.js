// Use https://www.npmjs.com/package/nanoid to create unique IDs
const {nanoid} = require("nanoid");
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require("content-type");

// Functions for working with fragment metadata/data using our DB
const {
    readFragment,
    writeFragment,
    readFragmentData,
    writeFragmentData,
    listFragments,
    deleteFragment,
} = require("./data");

class Fragment {
    constructor({id, ownerId, created, updated, type, size = 0}) {
        if (!ownerId) throw new Error("The owner ID is required");
        if (!type) throw new Error("The type of fragment is required");
        if (typeof size !== "number") throw new Error("The size of fragment must be a number");
        if (size < 0) throw new Error("The size of fragment can not be negative");
        if (!Fragment.isSupportedType(type)) throw new Error("The mimetype is not supported");

        this.id = id ?? nanoid();
        this.ownerId = ownerId;
        this.created = created ?? new Date().toISOString();
        this.updated = updated ?? new Date().toISOString();
        this.type = type;
        this.size = size;
    }

    /**
     * Returns the mime type (e.g., without encoding) for the fragment's type:
     * "text/html; charset=utf-8" -> "text/html"
     * @returns {string} fragment's mime type (without encoding)
     */
    get mimeType() {
        const {type} = contentType.parse(this.type);
        return type;
    }

    /**
     * Returns true if this fragment is a text/* mime type
     * @returns {boolean} true if fragment's type is text/*
     */
    get isText() {
        return this.mimeType.startsWith("text/");
    }

    /**
     * Returns the formats into which this fragment type can be converted
     * @returns {Array<string>} list of supported mime types
     */
    get formats() {
        switch (this.mimeType) {
            case "text/plain":
                return ["text/plain"];
            case "text/markdown":
                return ["text/markdown", "text/html", "text/plain"];
            case "text/html":
                return ["text/html", "text/plain"];
            case "application/json":
                return ["application/json", "text/plain"];
            case "image/png":
                return ["image/png", "image/jpeg", "image/webp", "image/gif"];
            case "image/jpeg":
                return ["image/png", "image/jpeg", "image/webp", "image/gif"];
            case "image/webp":
                return ["image/png", "image/jpeg", "image/webp", "image/gif"];
            case "image/gif":
                return ["image/png", "image/jpeg", "image/webp", "image/gif"];
            default:
                return [];
        }
    }

    /**
     * Get all fragments (id or full) for the given user
     * @param {string} ownerId user's hashed email
     * @param {boolean} expand whether to expand ids to full fragments
     * @returns Promise<Array<Fragment>>
     */
    static async byUser(ownerId, expand = false) {
        return await listFragments(ownerId, expand);
    }

    /**
     * Gets a fragment for the user by the given id.
     * @param {string} ownerId user's hashed email
     * @param {string} id fragment's id
     * @returns Promise<Fragment>
     */
    static async byId(ownerId, id) {
        const result = await readFragment(ownerId, id);
        return new Fragment(result);
    }

    /**
     * Delete the user's fragment data and metadata for the given id
     * @param {string} ownerId user's hashed email
     * @param {string} id fragment's id
     * @returns Promise
     */
    static delete(ownerId, id) {
        return deleteFragment(ownerId, id);
    }

    /**
     * Returns true if we know how to work with this content type
     * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
     * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
     */
    static isSupportedType(value) {
        let isSupported = false;
        const supportedType = [
            "text/plain",
            "text/markdown",
            "text/html",
            "application/json",
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/gif",
        ];
        supportedType.forEach((supportedType) => {
            if (value.includes(supportedType) || value.includes(`${supportedType}; charset=`)) {
                isSupported = true;
            }
        });
        return isSupported;
    }

    /**
     * Saves the current fragment to the database
     * @returns Promise
     */
    save() {
        this.updated = new Date().toISOString();
        return writeFragment(this);
    }

    /**
     * Gets the fragment's data from the database
     * @returns Promise<Buffer>
     */
    getData() {
        return readFragmentData(this.ownerId, this.id);
    }

    /**
     * Set's the fragment's data in the database
     * @param {Buffer} data
     * @returns Promise
     */
    async setData(data) {
        if (!data) throw new Error("The buffer data is required");
        this.updated = new Date().toISOString();
        this.size = data.length;
        return await writeFragmentData(this.ownerId, this.id, data);
    }
}

module.exports.Fragment = Fragment;
