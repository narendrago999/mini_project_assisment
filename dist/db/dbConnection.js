"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// db/dbConnection.ts
const mssql_1 = __importDefault(require("mssql"));
const dbConfig_1 = __importDefault(require("./dbConfig"));
const pool = new mssql_1.default.ConnectionPool(dbConfig_1.default);
const dbConnection = pool.connect();
exports.default = dbConnection;
