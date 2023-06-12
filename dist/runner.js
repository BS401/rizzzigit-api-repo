#!/bin/env node
import { __awaiter } from "tslib";
import DotEnv from 'dotenv';
import HTTP from 'http';
import { Server } from './core/server.js';
DotEnv.config();
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const http = HTTP.createServer();
    const server = new Server({
        http,
        mongoose: {
            url: new URL('mongodb+srv://cluster0.zno7yj8.mongodb.net/?retryWrites=true&w=majority'),
            connectOptions: {
                user: process.env.DB_USERNAME,
                pass: process.env.DB_PASSWORD,
                dbName: 'TWICEFanPage'
            }
        }
    });
    http.listen(8081);
    yield server.init();
});
void run();
