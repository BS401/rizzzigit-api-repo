var _NaverPollingClient_instances, _NaverPollingClient_server, _NaverPollingClient_client, _NaverPollingClient_mongoose, _NaverPollingClient_polling, _NaverPollingClient_naver, _NaverPollingClient_naverPolling, _NaverPollingClient_init;
import { __awaiter, __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import RepAndRip from '@repandrip/core';
import Naver from '@repandrip/naver-scraper';
import NaverPolling from '@repandrip/polling-naver';
import Polling from '@repandrip/polling-core';
import Crypto from 'crypto';
import FS from 'fs';
import { Client } from 'adswebsitewrapper';
import { NewsContentType } from './models.js';
export class NaverPollingClient {
    constructor(server, mongoose) {
        _NaverPollingClient_instances.add(this);
        _NaverPollingClient_server.set(this, void 0);
        _NaverPollingClient_client.set(this, void 0);
        _NaverPollingClient_mongoose.set(this, void 0);
        _NaverPollingClient_polling.set(this, void 0);
        _NaverPollingClient_naver.set(this, void 0);
        _NaverPollingClient_naverPolling.set(this, void 0);
        __classPrivateFieldSet(this, _NaverPollingClient_server, server, "f");
        __classPrivateFieldSet(this, _NaverPollingClient_client, new RepAndRip.Client({
            downloadParallelCount: 5
        }), "f");
        __classPrivateFieldSet(this, _NaverPollingClient_mongoose, mongoose, "f");
        __classPrivateFieldSet(this, _NaverPollingClient_polling, new Polling.Polling(__classPrivateFieldGet(this, _NaverPollingClient_client, "f"), (() => {
            const ConfigModel = mongoose.model('config', new mongoose.Schema({
                key: { type: String, required: true },
                value: { type: Object, required: false }
            }));
            return {
                set: (key, value) => __awaiter(this, void 0, void 0, function* () {
                    yield ConfigModel.deleteMany({ key });
                    yield ConfigModel.create({ key, value });
                }),
                get: (key) => __awaiter(this, void 0, void 0, function* () { var _a; return (_a = (yield ConfigModel.findOne({ key }))) === null || _a === void 0 ? void 0 : _a.value; }),
                isset: (key) => __awaiter(this, void 0, void 0, function* () { return (yield ConfigModel.exists({ key })) != null; }),
                unset: (key) => __awaiter(this, void 0, void 0, function* () { yield ConfigModel.deleteMany({ key }); })
            };
        })()), "f");
        __classPrivateFieldSet(this, _NaverPollingClient_naver, new Naver.Client(__classPrivateFieldGet(this, _NaverPollingClient_client, "f")), "f");
        __classPrivateFieldSet(this, _NaverPollingClient_naverPolling, new NaverPolling.PollingWorker(__classPrivateFieldGet(this, _NaverPollingClient_polling, "f")), "f");
        __classPrivateFieldGet(this, _NaverPollingClient_client, "f").on('debug', (message) => {
            if (!message.includes('Request Manager')) {
                return;
            }
            console.log(`[${Date.now()}] ${message}`);
        });
        void __classPrivateFieldGet(this, _NaverPollingClient_instances, "m", _NaverPollingClient_init).call(this);
    }
}
_NaverPollingClient_server = new WeakMap(), _NaverPollingClient_client = new WeakMap(), _NaverPollingClient_mongoose = new WeakMap(), _NaverPollingClient_polling = new WeakMap(), _NaverPollingClient_naver = new WeakMap(), _NaverPollingClient_naverPolling = new WeakMap(), _NaverPollingClient_instances = new WeakSet(), _NaverPollingClient_init = function _NaverPollingClient_init() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new Client({
            storage: (() => {
                let object = {};
                return {
                    clear: () => {
                        object = {};
                    },
                    getItem: (key) => object[key],
                    setItem: (key, value) => { object[key] = value; },
                    length: 0,
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    removeItem: (key) => { delete object[key]; },
                    key: (index) => { return Object.keys(object)[index]; }
                };
            })()
        });
        yield client.resources.authentication.login(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
        const naverWorker = __classPrivateFieldGet(this, _NaverPollingClient_naverPolling, "f");
        const subscription = naverWorker.map.series.twice = new NaverPolling.SeriesSubscription(naverWorker, yield __classPrivateFieldGet(this, _NaverPollingClient_naver, "f").getSeries(29747755, 517466));
        yield __classPrivateFieldGet(this, _NaverPollingClient_polling, "f").add(__classPrivateFieldGet(this, _NaverPollingClient_naverPolling, "f"));
        const onPost = (post) => __awaiter(this, void 0, void 0, function* () {
            const { models: { News, NewsContent } } = __classPrivateFieldGet(this, _NaverPollingClient_server, "f");
            const thumbnail = yield (() => __awaiter(this, void 0, void 0, function* () {
                if (Array.isArray(post.body)) {
                    for (const entry of post.body) {
                        if (entry.type === 'image') {
                            const dest = `/tmp/${Crypto.randomInt(10000)}.${Date.now()}`;
                            try {
                                yield entry.download('thumb', dest);
                                const buffer = yield FS.promises.readFile(dest);
                                console.log('Uploading downloaded file.');
                                const file = yield client.resources.files.upload(Uint8Array.from(buffer));
                                return file.id;
                            }
                            catch (e) {
                                console.log(e);
                            }
                            finally {
                                if (FS.existsSync(dest)) {
                                    FS.unlinkSync(dest);
                                }
                            }
                        }
                    }
                }
                else {
                    console.log(`Post ${post.ID} is skipped.`);
                }
                return null;
            }))();
            if (thumbnail == null) {
                return;
            }
            console.log(`Thumbnail for news: ${post.ID} ${thumbnail}`);
            const news = yield News.create({
                createTime: Date.now(),
                updateTime: Date.now(),
                title: post.title,
                thumbnail
            });
            console.log(`News ID: ${news.id}`);
            if (Array.isArray(post.body)) {
                for (const postContent of post.body) {
                    switch (postContent.type) {
                        case 'text': {
                            yield NewsContent.create({
                                createTime: Date.now(),
                                updateTime: Date.now(),
                                newsId: news.id,
                                contentType: NewsContentType.Text,
                                content: postContent.content
                            });
                            break;
                        }
                        case 'image': {
                            const dest = `/tmp/${Crypto.randomInt(10000)}.${Date.now()}`;
                            try {
                                yield postContent.download('thumb', dest);
                                const buffer = yield FS.promises.readFile(dest);
                                const file = yield client.resources.files.upload(Uint8Array.from(buffer));
                                yield NewsContent.create({
                                    createTime: Date.now(),
                                    updateTime: Date.now(),
                                    newsId: news.id,
                                    contentType: NewsContentType.Image,
                                    url: file.rawUrl.toString()
                                });
                            }
                            catch (_a) { }
                            finally {
                                if (FS.existsSync(dest)) {
                                    FS.unlinkSync(dest);
                                }
                            }
                            break;
                        }
                        case 'link': {
                            yield NewsContent.create({
                                createTime: Date.now(),
                                updateTime: Date.now(),
                                newsId: news.id,
                                contentType: NewsContentType.Link,
                                name: postContent.link.toString(),
                                link: postContent.link.toString()
                            });
                            break;
                        }
                    }
                }
            }
        });
        subscription.events.on('post', (post) => __awaiter(this, void 0, void 0, function* () { yield onPost(post); }));
        void (() => __awaiter(this, void 0, void 0, function* () {
            while (true) {
                yield subscription.update();
                yield new Promise((resolve) => setTimeout(resolve, 30000));
            }
        }))();
    });
};
