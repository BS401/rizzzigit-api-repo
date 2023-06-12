import { __awaiter } from "tslib";
import { ResponseError } from '../../core/server.js';
import { parseContent } from './parse-content.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = request;
    if (body == null) {
        throw new ResponseError(400, 'Payload required.');
    }
    const { title, thumbnail } = body;
    if (!((typeof (title) === 'string') &&
        (typeof (thumbnail) === 'string') &&
        Array.isArray(body.contents))) {
        throw new ResponseError(400, 'Invalid payload.');
    }
    const contents = parseContent(body.contents);
    const { models: { News, NewsContent } } = server;
    const news = yield News.create({
        createTime: Date.now(),
        updateTime: Date.now(),
        title,
        thumbnail
    });
    for (const content of contents) {
        yield NewsContent.create(Object.assign({ createTime: Date.now(), updateTime: Date.now(), newsId: news.id }, content));
    }
    return server.createResponse(200, { newsId: news.id });
});
export default route;
