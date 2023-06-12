import { __awaiter } from "tslib";
const middleware = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    request.authentication = (yield (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { models: { Session, Account } } = server;
        const sessionId = (_a = request.cookies['session-id']) !== null && _a !== void 0 ? _a : request.query['session-id'];
        if (sessionId == null) {
            return null;
        }
        const session = yield Session.findById(sessionId);
        if ((session == null) || (session.lastActivity < (Date.now() - (1000 * 60 * 60)))) {
            return null;
        }
        const account = yield Account.findById(session.accountId);
        if (account == null) {
            return null;
        }
        session.lastActivity = BigInt(Date.now());
        yield session.save();
        return { session, account };
    }))());
});
export default middleware;
