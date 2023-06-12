import { __awaiter } from "tslib";
import Bcrypt from 'bcrypt';
import { ResponseError } from '../../core/server.js';
export default ({ noAccounts }, server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (!noAccounts) {
        throw new ResponseError(403, 'Account already set up.');
    }
    const { models: { Account } } = server;
    const { body } = request;
    if (body == null) {
        throw new ResponseError(400, 'Payload required.');
    }
    const { username, password } = body;
    if (!((typeof (username) === 'string') &&
        (typeof (password) === 'string'))) {
        throw new ResponseError(400, 'Invalid payload.');
    }
    if ((yield Account.exists({ username: username.toLowerCase() })) != null) {
        throw new ResponseError(400, 'Username already taken.');
    }
    yield Account.create({
        createTime: Date.now(),
        updateTime: Date.now(),
        username: username.toLowerCase(),
        password: yield Bcrypt.hash(password, 10)
    });
    return server.createResponse(200);
});
