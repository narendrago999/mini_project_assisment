"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const session = require('express-session');
const dbConnection_1 = __importDefault(require("./db/dbConnection"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
dotenv_1.default.config();
var port = process.env.PORT;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(session({
    secret: process.env.SESSION_KEY || '',
    resave: true,
    saveUninitialized: true,
}));
// Register Request
app.post('/register', async (req, res) => {
    const data = req.body;
    try {
        if (data.EmpId !== "" && data.fname !== "" && data.lname !== "" && data.number !== "" && data.email !== "" && data.password !== "") {
            const pool = await dbConnection_1.default;
            const query = `SELECT * FROM employee.UserInfo WHERE EMP_ID = '${data.EmpId}' `;
            const userExist = await pool.request().query(query);
            console.log(data.EmpId);
            console.log(userExist);
            console.log(data.fname);
            if (userExist.recordset.length > 0) {
                res.status(409).json({ message: "User Already Registered" });
            }
            else {
                try {
                    const pool = await dbConnection_1.default;
                    const query = `INSERT INTO employee.UserInfo(EMP_ID,FirstName,	
              LastName,Number,	
              Employee_Email,
              Password) VALUES('${data.EmpId}','${data.fname}','${data.lname}','${data.number}','${data.email}','${data.password}')`;
                    await pool.request().query(query);
                    res.status(201).json({ message: "User Created" });
                }
                catch (error) {
                    console.log(error);
                }
            }
        }
        else {
            res.json({ message: "empty data" });
        }
    }
    catch (error) {
        console.log(error);
    }
});
// Login Request
app.post("/login", async (req, res) => {
    const data = req.body;
    console.log(data.password);
    if (data.email !== "" && data.password != "") {
        try {
            const pool = await dbConnection_1.default;
            const query = `SELECT * FROM employee.UserInfo WHERE Employee_Email = '${data.email}'`;
            const userExist = await pool.request().query(query);
            console.log(userExist);
            const user = userExist.recordset[0];
            console.log(data.email);
            if (user == undefined) {
                res.status(200).json({ message: "User Not Found" });
            }
            else {
                if (user.Password === data.password) {
                    res.status(200).json({ message: "Login", data: user });
                }
                else {
                    res.status(404).json({ message: "password not matching" });
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    else {
        res.json({ message: "empty data" });
    }
});
// app.get('/', async (req, res) => {
// //   const user = new User(1, 'john_doe', 'john@example.com');
// //   res.send(user.username);
//   try {
//     const pool = await dbConnection;
//     const result = await pool.request().query('SELECT * FROM Country');
//     res.json(result.recordset);
//   } catch (error) {
//     console.error('Database error:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
