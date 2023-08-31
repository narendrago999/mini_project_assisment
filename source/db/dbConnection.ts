// db/dbConnection.ts
import sql from 'mssql';
import dbConfig from './dbConfig';

const pool = new sql.ConnectionPool(dbConfig);
const dbConnection = pool.connect();

export default dbConnection;
