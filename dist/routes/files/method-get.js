import { __awaiter } from "tslib";
import { ResponseError } from '../../core/server.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { pathArray } = request;
    const fileId = (_c = (_b = (_a = pathArray[1]) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : '';
    if (fileId === '') {
        throw new ResponseError(400, 'Invalid file id.');
    }
    const { models: { File, FileBuffer } } = server;
    const file = yield File.findById(fileId);
    if (file == null) {
        throw new ResponseError(404, 'File not found.');
    }
    if (pathArray[2] === 'raw') {
        response.setHeader('Content-Length', file.size);
        response.setHeader('Cache-Control', 'max-age=86400');
        for (const fileBufferMetadata of yield FileBuffer.find({ fileId: file.id }, { blockSize: 1, _id: 1 })) {
            response.write((_d = (yield FileBuffer.findById(fileBufferMetadata._id))) === null || _d === void 0 ? void 0 : _d.data);
        }
        return null;
    }
    return server.createResponse(200, server.leanDocument(file));
});
export default route;
