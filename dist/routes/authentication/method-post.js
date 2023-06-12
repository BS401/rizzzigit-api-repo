import { __awaiter } from "tslib";
import Bcrypt from 'bcrypt';
import { ResponseError } from '../../core/server.js';
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { body: post } = request;
    if (post == null) {
        throw new ResponseError(400, 'Payload required.');
    }
    if (((_a = request.pathArray[1]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'logout') {
        const { authentication } = request;
        if (authentication != null) {
            authentication.session.deleteOne();
            return server.createResponse(200);
        }
        throw new ResponseError(400, 'Not logged in.');
    }
    const { username, password } = post;
    if (!((typeof (username) === 'string') &&
        (typeof (password) === 'string'))) {
        throw new ResponseError(400, 'Invalid payload.');
    }
    const { models: { Account, Session } } = server;
    const account = yield Account.findOne({ username: username.toLowerCase() });
    if ((account == null) || (yield Bcrypt.compare(password, account.password)) === false) {
        throw new ResponseError(400, 'Username or password invalid.');
    }
    const session = yield Session.create({
        createTime: Date.now(),
        updateTime: Date.now(),
        accountId: account.id,
        lastActivity: Date.now()
    });
    return server.createResponse(200, { sessionId: session._id });
});
export default route;
