/* ==== core/server.js ==== */
import http from 'http';
import fs from 'fs';
import path from "path";

const Request = $.extend(http.IncomingMessage, function () {
    $.base(this, ...arguments);
});

Request.prototype.get = function (name) {
    return this.headers[name.toLowerCase()];
};

const Response = $.extend(http.ServerResponse, function () {
    $.base(this, ...arguments);
});

Response.prototype.status = function (code) {
    this.statusCode = code;
    return this;
};

Response.prototype.has = function (name) {
    return this.hasHeader(name);
};

Response.prototype.get = function (name) {
    return this.getHeader(name);
};

Response.prototype.set = function (name, value) {
    this.setHeader(name, value);
    return this;
};

Response.prototype.close = function (type, body) {
    this.set('Powered-By', 'Deskive/Core');
    this.set('ETag', $.etag(body));

    if (this.statusCode === 204) {
        this.end();
        return;
    }

    if (this.req.get('If-None-Match') === this.get('ETag')) {
        this.status(304);
        this.end();
        return;
    }

    this.set('Content-Type', `${type}; charset=utf-8`);
    this.set('Content-Length', body.length);
    this.end(body);
};

Response.prototype.send = function (body) {
    this.close('text/html', body);
};

Response.prototype.json = function (body) {
    this.close('application/json', JSON.stringify(body));
};

Response.prototype.file = function (path) {
    fs.readFile(path, 'utf-8', (err, body) => {
        if (err) throw err;
        this.close('application/octet-stream', body);
    });
};

const Router = function () {
    this.routes = [];
};

Router.prototype.new = function (o) {
    const path = o.path
        .replace(/\//g, '\\/')
        .replace(/:(\w+)/g, '(?<$1>\[-\\w\]+)')
        .replace(/\*/g, '(.+)');
    o.regex = new RegExp('^' + path + '$');
    this.routes.push(o);
    return this;
};

const Path = function (path, router) {
    this.router = router;
    this.path = path;
};

Path.prototype.new = function (method, fn) {
    this.router.new({
        method: method,
        path: this.path,
        fn: fn
    });
    return this;
};

Path.prototype.get = function (fn) {
    return this.new('GET', fn);
};

Path.prototype.post = function (fn) {
    return this.new('POST', fn);
};

Path.prototype.patch = function (fn) {
    return this.new('PATCH', fn);
};

Path.prototype.delete = function (fn) {
    return this.new('DELETE', fn);
};

Router.prototype.path = function (path) {
    return new Path(path, this);
};

Router.prototype.use = function (fn) {
    return this.new({
        method: 'USE',
        path: '/',
        fn: fn
    });
};

Router.prototype.get = function (path, fn) {
    return this.new({
        method: 'GET',
        path: path,
        fn: fn
    });
};

Router.prototype.post = function (path, fn) {
    return this.new({
        method: 'POST',
        path: path,
        fn: fn
    });
};

Router.prototype.patch = function (path, fn) {
    return this.new({
        method: 'PATCH',
        path: path,
        fn: fn
    });
};

Router.prototype.delete = function (path, fn) {
    return this.new({
        method: 'DELETE',
        path: path,
        fn: fn
    });
};

const Server = $.extend(Router, function () {
    $.base(this);
    this.server = http.createServer(Server.options, Server.requestListener.bind(this));
});

Server.options = {
    IncomingMessage: Request,
    ServerResponse: Response
};

Server.requestListener = async function (req, res) {
    for (const route of this.routes) {

        const match = req.url.match(route.regex);
        req.params = (match && match.groups) || {};

        if (route.method === 'USE') {
            if (await new Promise(async (resolve) => {
                await route.fn(req, res, resolve);
            })) break;
            continue;
        }

        if (route.method === req.method && match) {
            if (await new Promise(async (resolve) => {
                await route.fn(req, res);
                resolve(true);
            })) break;
        }

    }
};

Server.json = async function (req, res, next) {
    req.body = String();
    for await (const chunk of req) { req.body += chunk }
    if (req.body) req.body = JSON.parse(req.body);
    else req.body = {};
    next();
};


Server.logger = function (req, res, next) {
    res.on('finish', () => {
        console.log(req.method, req.url, res.statusCode, res.statusMessage);
    });
    next();
};

Server.public = async function (req, res, next) {
    let filePath = './public' + req.url;
    if (filePath.endsWith('/')) filePath = filePath.slice(0, -1);
    let fileExt;
    try {
        if (fs.lstatSync(filePath).isDirectory() ) {
            filePath = filePath + '/index.html';
        }
        fileExt = path.extname(filePath);
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css'
        };
        const mimeType = (ext) => {
            const type = mimeTypes[ext];
            return type || 'application/octet-stream'
        };
        res.close(mimeType(fileExt), data);
        next(true);
    } catch (e) {
        next();
    }
};

Server.lost = function (req, res) {
    res.status(404).send(`<pre>Cannot ${req.method} ${req.url}</pre>`);
};

Server.prototype.listen = function (port, fn) {
    this.get('*', Server.lost);
    this.server.listen(port, fn);
};

/* ==== core/server.js ==== */
export default Server;
