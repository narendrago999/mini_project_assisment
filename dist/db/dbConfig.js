"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    user: process.env.USER,
    password: process.env.PASSWORD,
    server: process.env.SERVER || "",
    database: process.env.DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true, // Set to true if you're on Windows
    },
};
exports.default = config;
