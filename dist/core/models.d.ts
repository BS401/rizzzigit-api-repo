/// <reference types="node" resolution-mode="require"/>
import type Mongoose from 'mongoose';
import { type Server } from './server.js';
export interface BaseResource {
    createTime: number;
    updateTime: number;
}
export interface Account extends BaseResource {
    username: string;
    password: string;
}
export interface Session extends BaseResource {
    accountId: StringConstructor;
    lastActivity: bigint;
}
export interface UploadToken extends BaseResource {
}
export interface File extends BaseResource {
    size: number;
    completed: boolean;
}
export interface FileBuffer extends BaseResource {
    fileId: string;
    blockSize: number;
    data: Uint8Array;
}
export interface News extends BaseResource {
    title: string;
    thumbnail: string;
}
export declare enum NewsContentType {
    Image = 0,
    Text = 1,
    Link = 2
}
export interface NewsContent extends BaseResource {
    newsId: string;
    contentType: NewsContentType;
}
export interface NewsImageContent extends NewsContent {
    contentType: NewsContentType.Image;
    url: string;
}
export interface NewsTextContent extends NewsContent {
    contentType: NewsContentType.Text;
    content: string;
}
export interface NewsLinkContent extends NewsContent {
    contentType: NewsContentType.Link;
    name: string;
    link: string;
}
export interface Discography extends BaseResource {
}
export interface Schedule extends BaseResource {
}
export type Document<T> = (Mongoose.Document<unknown, Record<string, unknown>, T> & Omit<Account & Required<{
    _id: Mongoose.ObjectId;
}>, never>);
export declare class Models {
    #private;
    constructor(server: Server, mongoose: Mongoose.Mongoose);
    init(url: URL, options?: Mongoose.MongooseOptions): Promise<void>;
    Account: Mongoose.Model<Account>;
    Session: Mongoose.Model<Session>;
    UploadToken: Mongoose.Model<UploadToken>;
    File: Mongoose.Model<File>;
    FileBuffer: Mongoose.Model<FileBuffer>;
    News: Mongoose.Model<News>;
    NewsContent: Mongoose.Model<NewsContent>;
}
