import { __awaiter } from "tslib";
import { ResponseError } from '../../core/server.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { authentication } = request;
    if (authentication == null) {
        throw new ResponseError(401, 'Login required.');
    }
    const { session } = authentication;
    return server.createResponse(200, server.leanDocument(session));
});
export default route;
