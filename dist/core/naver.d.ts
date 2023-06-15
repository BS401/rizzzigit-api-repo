import type Mongoose from 'mongoose';
import { type Server } from './server.js';
export declare class NaverPollingClient {
    #private;
    constructor(server: Server, mongoose: Mongoose.Mongoose);
}
