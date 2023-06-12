var _Models_server, _Models_mongoose;
import { __awaiter, __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
export var NewsContentType;
(function (NewsContentType) {
    NewsContentType[NewsContentType["Image"] = 0] = "Image";
    NewsContentType[NewsContentType["Text"] = 1] = "Text";
    NewsContentType[NewsContentType["Link"] = 2] = "Link";
})(NewsContentType || (NewsContentType = {}));
export class Models {
    constructor(server, mongoose) {
        _Models_server.set(this, void 0);
        _Models_mongoose.set(this, void 0);
        __classPrivateFieldSet(this, _Models_server, server, "f");
        __classPrivateFieldSet(this, _Models_mongoose, mongoose, "f");
        const baseResourceSchema = new mongoose.Schema({
            createTime: { type: Number, required: true },
            updateTime: { type: Number, required: true }
        });
        this.Account = mongoose.model('Account', new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            password: { type: String, required: true }
        }).add(baseResourceSchema));
        this.Session = mongoose.model('Session', new mongoose.Schema({
            accountId: { type: String, required: true },
            lastActivity: { type: BigInt, required: true }
        }));
        this.UploadToken = mongoose.model('UploadToken', new mongoose.Schema({}).add(baseResourceSchema));
        this.File = mongoose.model('File', new mongoose.Schema({
            size: { type: Number, required: true }
        }).add(baseResourceSchema));
        this.FileBuffer = mongoose.model('FileBuffer', new mongoose.Schema({
            fileId: { type: String, required: true },
            blockSize: { type: Number, required: true },
            data: { type: Buffer, required: true }
        }).add(baseResourceSchema));
        this.News = mongoose.model('News', new mongoose.Schema({
            title: { type: String, required: true },
            thumbnail: { type: String, required: true }
        }).add(baseResourceSchema));
        this.NewsContent = mongoose.model('NewsContent', new mongoose.Schema({
            newsId: { type: String, required: true },
            contentType: { type: Number, required: true }
        }).add(baseResourceSchema));
    }
    init(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _Models_mongoose, "f").connect(url.toString(), options);
        });
    }
}
_Models_server = new WeakMap(), _Models_mongoose = new WeakMap();
