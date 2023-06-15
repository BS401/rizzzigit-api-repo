import { __awaiter } from "tslib";
const allowedOrigins = [
    'http://localhost:8080',
    'https://twice.cjoma.repl.co'
];
const middleware = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const originHeader = request.header('origin');
    if ((originHeader != null) && allowedOrigins.includes(originHeader)) {
        response.setHeader('Access-Control-Allow-Methods', '*');
        response.setHeader('Access-Control-Allow-Headers', '*');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Max-Age', '*');
    }
});
export default middleware;
