import { __asyncValues, __awaiter } from "tslib";
import { ResponseError } from '../server.js';
const middleware = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    request.body = yield (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        var _d, _e, _f;
        if (!((request.method === 'POST') ||
            (request.method === 'PUT'))) {
            return;
        }
        const buffers = [];
        let contentLength = Number(request.headers['content-length']);
        if (contentLength === 0) {
            return null;
        }
        if (Number.isNaN(contentLength)) {
            throw new ResponseError(400, 'Invalid content-length header.');
        }
        const mime = (_f = (_e = (_d = request.header('Content-Type')) === null || _d === void 0 ? void 0 : _d.toLowerCase()) === null || _e === void 0 ? void 0 : _e.split('/').slice(0, 2)) !== null && _f !== void 0 ? _f : [];
        switch (mime[0]) {
            case 'application': {
                if (mime[1] !== 'json') {
                    throw new ResponseError(400, 'Invalid content-type header.');
                }
                else if (contentLength > 4096) {
                    throw new ResponseError(400, 'Content-length too large.');
                }
                try {
                    for (var _g = true, request_1 = __asyncValues(request), request_1_1; request_1_1 = yield request_1.next(), _a = request_1_1.done, !_a; _g = true) {
                        _c = request_1_1.value;
                        _g = false;
                        const buffer = _c;
                        buffers.push(buffer);
                        contentLength -= buffer.length;
                        if (contentLength < 0) {
                            break;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_g && !_a && (_b = request_1.return)) yield _b.call(request_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (contentLength !== 0) {
                    throw new ResponseError(400, 'Content-length header mismatch.');
                }
                return JSON.parse(Buffer.concat(buffers).toString());
            }
            case 'image': {
                if (contentLength > 1024 * 1024 * 8) {
                    throw new ResponseError(400, 'Content-length too large.');
                }
                break;
            }
            default: throw new ResponseError(400, 'Invalid content-type header.');
        }
    }))();
});
export default middleware;
