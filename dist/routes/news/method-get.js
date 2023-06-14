import { __awaiter } from "tslib";
import { ResponseError } from '../../core/server.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { models: { News, NewsContent } } = server;
    const { pathArray } = request;
    const newsId = (_c = (_b = (_a = pathArray[1]) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : '';
    if (newsId === '') {
        const { query: { offset: offsetStr, length: lengthStr } } = request;
        const offset = Number(offsetStr);
        const length = Number(lengthStr);
        let query = News.find({}, undefined, {
            sort: {
                createTime: -1,
                _id: -1
            }
        });
        if (!Number.isNaN(offset)) {
            query = query.skip(offset);
        }
        if (!Number.isNaN(length)) {
            query = query.limit(length);
        }
        const news = yield Promise.all((yield query).map((news) => __awaiter(void 0, void 0, void 0, function* () {
            const contents = (yield NewsContent.find({ newsId: news.id })).map((entry) => server.leanDocument(entry));
            return Object.assign(server.leanDocument(news), { contents });
        })));
        return server.createResponse(200, news);
    }
    const news = yield News.findById(newsId);
    if (news == null) {
        throw new ResponseError(404, 'News not found.');
    }
    const contents = (yield NewsContent.find({ newsId: news.id })).map((entry) => server.leanDocument(entry));
    return server.createResponse(200, Object.assign(server.leanDocument(news), { contents }));
});
export default route;
