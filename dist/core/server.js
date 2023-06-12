var _Server_instances, _Server_express, _Server_options, _Server_mongoose, _Server_onRequest, _Server_runRequest, _ResponseError_status;
import { __awaiter, __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import Express from 'express';
import Mongoose from 'mongoose';
import { Models } from './models.js';
export class Server {
    constructor(options) {
        _Server_instances.add(this);
        _Server_express.set(this, void 0);
        _Server_options.set(this, void 0);
        _Server_mongoose.set(this, void 0);
        __classPrivateFieldSet(this, _Server_express, Express(), "f");
        __classPrivateFieldSet(this, _Server_options, Object.assign({}, options), "f");
        __classPrivateFieldSet(this, _Server_mongoose, new Mongoose.Mongoose(__classPrivateFieldGet(this, _Server_options, "f").mongoose.options), "f");
        this.models = new Models(this, __classPrivateFieldGet(this, _Server_mongoose, "f"));
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const { http, https } = __classPrivateFieldGet(this, _Server_options, "f");
            const express = __classPrivateFieldGet(this, _Server_express, "f");
            if (http != null) {
                http.on('request', express);
            }
            if (https != null) {
                https.on('request', express);
            }
            express.use((yield import('cookie-parser')).default());
            express.use((request, response) => { void __classPrivateFieldGet(this, _Server_instances, "m", _Server_onRequest).call(this, request, response); });
            yield this.models.init(__classPrivateFieldGet(this, _Server_options, "f").mongoose.url, __classPrivateFieldGet(this, _Server_options, "f").mongoose.connectOptions);
        });
    }
    execRoute(request, response, route) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield route.default(this, request, response);
        });
    }
    createResponse(status, data) {
        if (data instanceof Error) {
            throw Object.assign(data, status);
        }
        return { status, data };
    }
    leanDocument(document) {
        const object = Object.assign({}, document.toJSON());
        delete object._id;
        delete object.__v;
        return object;
    }
}
_Server_express = new WeakMap(), _Server_options = new WeakMap(), _Server_mongoose = new WeakMap(), _Server_instances = new WeakSet(), _Server_onRequest = function _Server_onRequest(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield __classPrivateFieldGet(this, _Server_instances, "m", _Server_runRequest).call(this, request, response);
        if (result != null) {
            response.statusCode = result.status;
            const toSend = (() => {
                response.setHeader('Content-Type', 'application/json');
                const data = Buffer.from(JSON.stringify(result, (key, value) => {
                    if (typeof (value) === 'bigint') {
                        return value.toString();
                    }
                    return value;
                }), 'utf-8');
                response.setHeader('Content-Length', data.length);
                return data;
            })();
            if (request.method !== 'OPTIONS') {
                response.write(toSend);
            }
        }
        response.end();
    });
}, _Server_runRequest = function _Server_runRequest(request, response) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (const { default: middleware } of [
                yield import('./middlewares/path-array.js'),
                yield import('./middlewares/authentication.js'),
                yield import('./middlewares/body.js')
            ]) {
                yield middleware(this, request, response);
            }
            return yield this.execRoute(request, response, yield import('../routes/main.js'));
        }
        catch (error) {
            const encodeError = (error) => {
                const encoded = {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                };
                if (error.cause != null) {
                    encoded.cause = encodeError(error.stack);
                }
                return encoded;
            };
            return {
                status: (_a = error.status) !== null && _a !== void 0 ? _a : 500,
                error: encodeError(error)
            };
        }
    });
};
export class ResponseError extends Error {
    constructor(status, message) {
        super(message);
        _ResponseError_status.set(this, void 0);
        __classPrivateFieldSet(this, _ResponseError_status, status, "f");
    }
    get status() { return __classPrivateFieldGet(this, _ResponseError_status, "f"); }
}
_ResponseError_status = new WeakMap();
