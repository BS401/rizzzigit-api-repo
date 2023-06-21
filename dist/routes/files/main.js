import { __awaiter } from "tslib";
import { ResponseError } from '../../core/server.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { method, pathArray } = request;
    const fileId = (_b = (_a = request.pathArray[1]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '';
    switch (fileId) {
        case 'u':
        case 'upload': return yield server.execRoute(request, response, yield import('./upload.js'));
        case '': {
            switch (method) {
                case 'PUT': return yield server.execRoute(request, response, yield import('./method-put.js'));
                default: throw new ResponseError(400, 'Invalid method.');
            }
        }
        default: {
            switch (method) {
                case 'DELETE': {
                    const fileId = (_d = (_c = pathArray[1]) === null || _c === void 0 ? void 0 : _c.trim().toLowerCase()) !== null && _d !== void 0 ? _d : '';
                    yield server.models.File.deleteOne({ _id: fileId });
                    return server.createResponse(200);
                }
                case 'OPTIONS':
                case 'GET': return yield server.execRoute(request, response, yield import('./method-get.js'));
                default: throw new ResponseError(400, 'Invalid method.');
            }
        }
    }
});
export default route;
