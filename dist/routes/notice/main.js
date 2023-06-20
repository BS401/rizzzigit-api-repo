import { __awaiter } from "tslib";
import JSDOM from 'jsdom';
import { ResponseError } from '../../core/server.js';
const headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
};
const baseUrl = 'https://twice.jype.com';
const listCache = {};
const getList = (page) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    if (page in listCache) {
        return listCache[page];
    }
    const list = [];
    const dom = new JSDOM.JSDOM(yield (yield fetch(`${baseUrl}/Default/NoticeList?PgIndex=${page}`, {
        headers: Object.assign({}, headers)
    })).text());
    const { window: { document } } = dom;
    const { children } = document.querySelector('div.noticeList>ul');
    for (const child of Array.from(children)) {
        const { children: [element] } = child;
        const url = new URL(`${baseUrl}${element.href}`);
        const { searchParams: urlQuery } = url;
        const title = (_c = (_b = (_a = element.querySelector('span.tit')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '';
        const createTime = new Date((_f = (_e = (_d = element.querySelector('span.date')) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : '').getTime();
        const _id = (_g = urlQuery.get('AnSeq')) !== null && _g !== void 0 ? _g : '';
        list.push({ _id, createTime, updateTime: createTime, title });
    }
    return (listCache[page] = list);
});
// interface Notice extends NoticeEntry {
//   thumbnail: string
// }
// const getPicture = async (url: string): Promise<File> {
// }
// const get = async (id: string): Promise<Notice | null> => {
//   const dom = new JSDOM.JSDOM(await (await fetch(`${baseUrl}/Default/NoticeView?AnSeq=${id}`, {
//     headers: { ...headers }
//   })).text())
//   const { window: { document } } = dom
//   const { children: [, titleElement, dateElement] } = document.querySelector('div.boardView_header') as unknown as { children: HTMLParagraphElement[] }
//   const createTime = new Date(`${dateElement.textContent}`).getTime()
//   const contentElement = document.querySelector('div.thumbnail') as unknown as HTMLDivElement
//   for (const entry of Array.from(contentElement.children)) {
//   }
//   return {
//     _id: id,
//     createTime,
//     updateTime: createTime,
//     title: titleElement.textContent?.trim() ?? ''
//   }
// }
const route = (server, request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j;
    const { method } = request;
    switch (method) {
        case 'OPTIONS':
        case 'GET': {
            const { pathArray } = request;
            const id = (_j = (_h = pathArray[1]) === null || _h === void 0 ? void 0 : _h.trim().toLowerCase()) !== null && _j !== void 0 ? _j : '';
            if (id === '') {
                const { query: { offset: offsetStr, length: lengthStr } } = request;
                const list = [];
                let offset = offsetStr != null ? Number(offsetStr) : 0;
                const length = lengthStr != null ? Number(lengthStr) : 10;
                if (Number.isNaN(offset) ||
                    Number.isNaN(length)) {
                    throw new ResponseError(400, 'Invalid query.');
                }
                let page = 1;
                while (list.length < length) {
                    let received = 0;
                    while (offset >= 10) {
                        offset -= 10;
                        page++;
                    }
                    for (const entry of yield getList(page)) {
                        received++;
                        if (offset > 0) {
                            offset--;
                            continue;
                        }
                        list.push(entry);
                    }
                    if (received < 10) {
                        break;
                    }
                    page++;
                }
                return server.createResponse(200, list);
            }
            break;
        }
    }
    throw new ResponseError(400, 'Invalid method.');
});
export default route;
