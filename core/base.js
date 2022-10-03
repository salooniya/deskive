/* ==== core/base.js ==== */
import crypto from "crypto";
import path from "path";
import url from "url";
import fs from "fs";

const type = function (value) {
    return value.constructor;
};

const base = function (ins, ...args) {
    type(ins).base.call(ins, ...args);
};

const extend = function (base, fn) {
    fn.base = base;
    fn.prototype.__proto__ = base.prototype;
    return fn;
};

const filename = function (meta) {
    return url.fileURLToPath(meta.url);
};

const dirname = function (meta) {
    return path.dirname(filename(meta));
};

const resolve = function (meta, relativePath) {
    return path.resolve(dirname(meta), relativePath);
};

const hasher = function (data) {
    return crypto.createHash('sha1').update(data, 'utf-8').digest('hex');
};

const etag = function (body) {
    return `W/"${hasher(body)}"`;
};

const timer = function (t) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, t);
    });
};

const lorem = function (paragraph = false) {
    if (paragraph) return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
        'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ' +
        'ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum ' +
        'dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia ' +
        'deserunt mollit anim id est laborum';
    return 'Lorem Ipsum';
};

const config = function (path) {
    const envraw = fs.readFileSync(path, 'utf-8');
    envraw.split('\n').map(row => row.trim()).forEach(row => {
        const [key, value] = row.split('=');
        process.env[key] = value;
    });
};

/* ==== core/base.js ==== */
global.$ = {
    base,
    extend,
    filename,
    dirname,
    resolve,
    hasher,
    etag,
    timer,
    lorem,
    config
};
