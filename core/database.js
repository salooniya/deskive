/* ==== core/database.js ==== */
import crypto from "crypto";
import fs from "fs";
import pfs from "fs/promises";

const Collection = function (name) {
    this.name = name;
    this.docs = [];
};

Collection.from = function (c) {
    const nc = new Collection(c.name);
    nc.docs = c.docs;
    return nc;
};

Collection.prototype.create = function (o) {
    const id = crypto.randomUUID();
    const doc = {id, ...o};
    this.docs.push(doc);
    return doc;
};

Collection.prototype.getOneById = function (id) {
    return this.docs.find((doc) => doc.id === id);
};

Collection.prototype.updateOneById = function (id, o) {
    const doc = this.docs.find((doc) => doc.id === id);
    if (doc) Object.assign(doc, o);
    return doc;
};

Collection.prototype.deleteOneById = function (id) {
    let index;
    const doc = this.docs.find((doc, i) => {
        if (doc.id === id) {
            index = i;
            return true;
        }
    });
    if (doc) this.docs.splice(index, 1);
    return doc;
};

const Database = function (name) {
    this.name = name;
    this.collections = [];

    try {
        const db = this.read();
        this.name = db.name;
        this.collections = db.collections;
    } catch (e) {
        this.write();
    }
};

Database.prototype.read = function () {
    const data = fs.readFileSync(`./database/${this.name}`, 'utf-8');
    return JSON.parse(Buffer.from(data, 'hex').toString('utf-8'));
};

Database.prototype.write = function () {
    const data = Buffer.from(JSON.stringify(this), 'utf-8').toString('hex');
    fs.writeFileSync(`./database/${this.name}`, data);
};


Database.prototype.collection = function (name) {
    let collection = this.collections.find(c => c.name === name);
    if (collection) return Collection.from(collection);
    collection = new Collection(name);
    this.collections.push(collection);
    return collection;
};

Database.prototype.save = async function () {
    const path = `./database/${this.name}`;
    const data = Buffer.from(JSON.stringify(this), 'utf-8').toString('hex');
    await pfs.writeFile(path, data);
};

/* ==== core/database.js ==== */
export default Database;
