import type Express from 'express';
import { type ServerResponse, type Server } from '../../core/server.js';
declare const _default: ({ noAccounts }: {
    noAccounts: boolean;
}, server: Server, request: Express.Request, response: Express.Response) => Promise<ServerResponse | null>;
export default _default;
