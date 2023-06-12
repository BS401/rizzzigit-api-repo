import { __asyncValues, __awaiter } from "tslib";
import { ResponseError } from '../../core/server.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const { method, pathArray } = request;
    if (method !== 'POST') {
        throw new ResponseError(400, 'Invalid method.');
    }
    const { models: { UploadToken, File, FileBuffer } } = server;
    const tokenId = pathArray[2];
    if (tokenId == null) {
        throw new ResponseError(400, 'token-id get query required.');
    }
    const token = yield UploadToken.findById(tokenId);
    if ((token == null) ||
        (token.createTime < (Date.now() - 30000))) {
        throw new ResponseError(404, 'Token does not exist or invalid.');
    }
    yield token.deleteOne();
    const file = yield File.create({
        createTime: Date.now(),
        updateTime: Date.now(),
        size: 0,
        completed: false
    });
    let size = 0;
    const bufferSize = 1024 * 1024;
    try {
        for (var _d = true, _e = __asyncValues(request), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
            _c = _f.value;
            _d = false;
            const buffer = _c;
            size += buffer.length;
            for (let startIndex = 0; startIndex < buffer.length; startIndex += bufferSize) {
                const endIndex = Math.min(buffer.length, startIndex + bufferSize);
                yield FileBuffer.create({
                    createTime: Date.now(),
                    updateTime: Date.now(),
                    fileId: file.id,
                    blockSize: endIndex - startIndex,
                    data: buffer.subarray(startIndex, endIndex)
                });
            }
            file.size = size;
            yield file.save();
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
        }
        finally { if (e_1) throw e_1.error; }
    }
    file.completed = true;
    yield file.save();
    return server.createResponse(200, { fileId: file.id });
});
export default route;
