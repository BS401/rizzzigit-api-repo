import { __awaiter } from "tslib";
import { ResponseError } from '../../core/server.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    // const { models: { News } } = server
    // const { pathArray } = request
    // const newsId = pathArray[1]?.trim()?.toLowerCase() ?? ''
    // if (newsId === '') {
    //   throw new ResponseError(400, 'Invalid news id.')
    // }
    // const news = await News.findById(newsId)
    // if (news == null) {
    //   throw new ResponseError(404, 'News not found.')
    // }
    throw new ResponseError(501, 'Method not implemented.');
});
export default route;
