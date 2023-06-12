import { __awaiter } from "tslib";
import { ResponseError } from '../../core/server.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { method } = request;
    const { models: { Account } } = server;
    if ((yield Account.count()) === 0) {
        switch (method) {
            case 'PUT': return yield server.execRoute(request, response, {
                default: (yield import('./method-put.js')).default.bind(undefined, {
                    noAccounts: true
                })
            });
            default: throw new ResponseError(400, 'Setup required.');
        }
    }
    switch (method) {
        case 'OPTIONS':
        case 'GET': return yield server.execRoute(request, response, yield import('./method-get.js'));
        case 'POST': return yield server.execRoute(request, response, yield import('./method-post.js'));
        case 'PUT': return yield server.execRoute(request, response, {
            default: ((yield import('./method-put.js')).default.bind(undefined, {
                noAccounts: false
            }))
        });
        default: throw new ResponseError(400, 'Invalid method.');
    }
});
export default route;
