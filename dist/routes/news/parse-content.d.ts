import { type NewsImageContent, type NewsTextContent, type NewsLinkContent } from '../../core/models.js';
type _ParsedNewsContent<T> = Omit<T, 'createTime' | 'updateTime' | 'newsId'>;
export type ParsedNewsImageContent = _ParsedNewsContent<NewsImageContent>;
export type ParsedNewsTextContent = _ParsedNewsContent<NewsTextContent>;
export type ParsedNewsLinkContent = _ParsedNewsContent<NewsLinkContent>;
export type ParsedNewsContent = ParsedNewsImageContent | ParsedNewsTextContent | ParsedNewsLinkContent;
export declare const parseContent: (contents: any) => ParsedNewsContent[];
export {};
