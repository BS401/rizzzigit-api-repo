import { __awaiter } from "tslib";
import { ResponseError } from '../core/server.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { pathArray } = request;
    switch ((_a = pathArray[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) {
        case 'a':
        case 'auth':
        case 'authentication': return yield server.execRoute(request, response, yield import('./authentication/main.js'));
        case 'f':
        case 'files': return yield server.execRoute(request, response, yield import('./files/main.js'));
        case 'n':
        case 'news': return yield server.execRoute(request, response, yield import('./news/main.js'));
        default: throw new ResponseError(400, 'Invalid path.');
    }
});
export default route;
