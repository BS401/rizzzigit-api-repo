import { __awaiter } from "tslib";
export const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { method, pathArray } = request;
    switch (method === null || method === void 0 ? void 0 : method.toLowerCase()) {
        case 'GET': {
            const photoId = (_b = (_a = pathArray[1]) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase()) !== null && _b !== void 0 ? _b : '';
            if (photoId == null) {
                const { query: { offset: offsetStr, length: lengthStr } } = request;
                const offset = Number(offsetStr);
                const length = Number(lengthStr);
                if (!Number.isNaN(offset))
                    ;
            }
            else {
            }
            break;
        }
        case 'PUT': {
            break;
        }
    }
});
export default route;
