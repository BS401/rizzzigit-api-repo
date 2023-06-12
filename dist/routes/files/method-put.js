import { __awaiter } from "tslib";
import { ResponseError } from '../../core/server.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.authentication == null) {
        throw new ResponseError(401, 'Login required.');
    }
    const { models: { UploadToken } } = server;
    const uploadToken = yield UploadToken.create({
        createTime: Date.now(),
        updateTime: Date.now()
    });
    return server.createResponse(200, { tokenId: uploadToken.id });
});
export default route;
