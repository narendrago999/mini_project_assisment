import mssql from 'mssql';
import dotenv from 'dotenv'
dotenv.config()
const config: mssql.config = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  server: process.env.SERVER || "",
  database: process.env.DATABASE,
  options: {
    encrypt: true, // Set to true if using Azure
    trustServerCertificate: true, // Set to true if you're on Windows
  },
};

export default config;
