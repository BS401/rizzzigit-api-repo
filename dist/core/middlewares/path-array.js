import { __awaiter } from "tslib";
const middleware = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    request.pathArray = (() => {
        const pathArray = [];
        for (let pathEntry of request.path.split('/')) {
            pathEntry = pathEntry.trim();
            if (pathEntry.length === 0) {
                continue;
            }
            pathArray.push(pathEntry);
        }
        return pathArray;
    })();
});
export default middleware;
