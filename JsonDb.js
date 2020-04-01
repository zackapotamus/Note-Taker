const fs = require("fs");
import { v4 as uuidv4 } from 'uuid';
// import uuid from 'uuid';
// const { v4 } = uuid;
class JsonDb {
    constructor(fullPathToJson) {
        this.path = fullPathToJson;
        this.parsed = [];
        this.stringified = JsonDb.getFileContents(this.path);
        if (this.stringified) {
            this.parsed = JSON.parse(this.stringified);
        }
    }
    static getFileContents(filePath) {
        return fs.readFileSync(filePath, {
            encoding: "utf8"
        });
    }
    insert(objectToInsert) {
        if (!objectToInsert.hasOwnProperty("id")) objectToInsert.id = uuidv4();
        this.parsed.push(objectToInsert);
        this.stringified = JSON.stringify(this.parsed);
        this.writeToDb();
        return objectToInsert;

    }
    delete(objectId) {
        this.parsed = this.parsed.filter((record) => record.id !== objectId);
        this.stringified = JSON.stringify(this.parsed);
        this.writeToDb();
    }
    getJson() {
        return this.stringified;
    }
    selectAll() {
        return this.parsed;
    }
    writeToDb() {
        fs.writeFileSync(this.path, this.stringified);
    }
}

module.exports = JsonDb;
export {JsonDb};