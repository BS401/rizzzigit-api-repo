import { __awaiter } from "tslib";
import { ResponseError } from '../../core/server.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { method, authentication } = request;
    switch (method) {
        case 'OPTIONS':
        case 'GET': return yield server.execRoute(request, response, yield import('./method-get.js'));
    }
    if (authentication == null) {
        throw new ResponseError(401, 'Login required.');
    }
    switch (method) {
        case 'PUT': return yield server.execRoute(request, response, yield import('./method-put.js'));
        case 'PATCH': return yield server.execRoute(request, response, yield import('./method-patch.js'));
        case 'DELETE': return yield server.execRoute(request, response, yield import('./method-delete.js'));
        default: throw new ResponseError(400, 'Invalid method.');
    }
});
export default route;
