import { __awaiter } from "tslib";
import { ResponseError } from '../../core/server.js';
export const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { method, pathArray } = request;
    const { models: { File, Picture } } = server;
    switch (method) {
        case 'GET': {
            const pictureId = (_b = (_a = pathArray[1]) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase()) !== null && _b !== void 0 ? _b : '';
            if (pictureId === '') {
                const { query: { offset: offsetStr, length: lengthStr } } = request;
                const offset = Number(offsetStr);
                const length = Number(lengthStr);
                let query = Picture.find({}, {}, {
                    sort: {
                        createDate: -1,
                        _id: -1
                    }
                });
                if (!Number.isNaN(offset)) {
                    query = query.skip(offset);
                }
                if (!Number.isNaN(length)) {
                    query = query.limit(length);
                }
                const result = [];
                for (const entry of yield query) {
                    result.push(server.leanDocument(entry));
                }
                return server.createResponse(200, result);
            }
            else {
                const picture = yield Picture.findById(pictureId);
                if (picture == null) {
                    throw new ResponseError(400, 'Picture not found.');
                }
                return server.createResponse(200, server.leanDocument(picture));
            }
        }
        case 'PUT': {
            if (request.authentication == null) {
                throw new ResponseError(400, 'Login required.');
            }
            const { body } = request;
            if (body == null) {
                throw new ResponseError(400, 'Payload required.');
            }
            const { fileId } = body;
            if (!((typeof (fileId) === 'string'))) {
                throw new ResponseError(400, 'Invalid payload.');
            }
            const file = yield File.findById(fileId);
            if (file == null) {
                throw new ResponseError(404, 'File not found.');
            }
            const picture = yield Picture.create({
                createTime: Date.now(),
                updateTime: Date.now(),
                fileId
            });
            return server.createResponse(200, { pictureId: picture.id });
        }
        default: throw new ResponseError(400, 'Invalid method.');
    }
});
export default route;
