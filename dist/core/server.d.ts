/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import Express from 'express';
import Mongoose from 'mongoose';
import type HTTP from 'http';
import type HTTPS from 'https';
import { type Document, Models } from './models.js';
export interface ServerOptions {
    http?: HTTP.Server;
    https?: HTTPS.Server;
    mongoose: {
        url: URL;
        options?: Mongoose.MongooseOptions;
        connectOptions?: Mongoose.ConnectOptions;
    };
}
export type ServerRoute = (server: Server, request: Express.Request, response: Express.Response) => Promise<ServerResponse | null>;
export type ServerMiddleware = (server: Server, request: Express.Request, response: Express.Response) => Promise<void>;
export interface ServerError {
    name: string;
    message: string;
    stack?: string;
    cause?: ServerError;
}
export type ServerResponse = {
    status: number;
} & ({
    status: number;
} | {
    error: ServerError;
} | {
    data: Record<string, any>;
});
export declare class Server {
    #private;
    constructor(options: ServerOptions);
    init(): Promise<void>;
    readonly models: Models;
    execRoute(request: Express.Request, response: Express.Response, route: {
        default: ServerRoute;
    }): Promise<ServerResponse | null>;
    createResponse(status: number, data?: Record<string, any> | Error): ServerResponse;
    leanDocument<T>(document: Document<T>): Record<string, any>;
}
export declare class ResponseError extends Error {
    #private;
    constructor(status: number, message?: string);
    get status(): number;
}
