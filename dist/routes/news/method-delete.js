import { __awaiter } from "tslib";
import { ResponseError } from '../../core/server.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { models: { News } } = server;
    const { pathArray } = request;
    const newsId = (_c = (_b = (_a = pathArray[1]) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : '';
    if (newsId === '') {
        throw new ResponseError(400, 'Invalid news id.');
    }
    const news = yield News.findById(newsId);
    if (news == null) {
        throw new ResponseError(404, 'News not found.');
    }
    yield news.deleteOne();
    return server.createResponse(200);
});
export default route;
