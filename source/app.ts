import express from 'express';
import cors from 'cors';
import dbConnection from './db/dbConnection';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { log } from 'console';
const app = express();
dotenv.config()
var port = process.env.PORT;
app.use(cors())
app.use(express.json())


// Register Request

app.post('/register', async (req, res) => {
  const data = req.body
  try {
    if (data.EmpId !== "" && data.fname !== "" && data.lname !== "" && data.number !== "" && data.email !== "" && data.password !== "") {

      const pool = await dbConnection
      const query = `SELECT * FROM employee.UserInfo WHERE EMP_ID = '${data.EmpId}' `
      const userExist = await pool.request().query(query)
      console.log(data.EmpId);
      console.log(userExist);

      console.log(data.fname);
      if (userExist.recordset.length > 0) {
        res.status(409).json({ message: "User Already Registered" })
      } else {
        try {

          const pool = await dbConnection
          const query = `INSERT INTO employee.UserInfo(EMP_ID,FirstName,	
              LastName,Number,	
              Employee_Email,
              Password) VALUES('${data.EmpId}','${data.fname}','${data.lname}','${data.number}','${data.email}','${data.password}')`
          await pool.request().query(query)
          res.status(201).json({ message: "User Created" })
        } catch (error) {
          console.log(error);

        }
      }
    } else {
      res.json({ message: "empty data" })
    }
  } catch (error) {
    console.log(error);

  }
})



// Login Request

app.post("/login", async (req, res) => {
  const data = req.body
  console.log(data.password);

  if (data.email !== "" && data.password != "") {
    try {
      const pool = await dbConnection
      const query = `SELECT * FROM employee.UserInfo WHERE Employee_Email = '${data.email}'`
      const userExist = await pool.request().query(query)
      console.log(userExist);

      const user = userExist.recordset[0]
      console.log(data.email);

      if (user == undefined) {
        res.status(200).json({ message: "User Not Found" })
      } else {


        if (user.Password === data.password) {
          const token = jwt.sign(data, 'naren', { expiresIn: '1h' })
          const pool = await dbConnection
          const tokenQuery = `UPDATE employee.UserInfo SET Token = '${token}' WHERE EMP_ID = '${user.EMP_ID}'`
          console.log(tokenQuery);

          await pool.request().query(tokenQuery)
          res.status(200).json({ message: "Login", data: user, token })
        } else {
          res.status(200).json({ message: "password not matching" })
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.json({ message: "empty data" })
  }

})


// admin request

app.post("/admin", async (req, res) => {
  const data = req.body
  console.log(data);

  try {
    const pool = await dbConnection
    const createAdminTableQuery = `SELECT *
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' 
    AND TABLE_NAME = 'TrainingDetails'`
    const adminTable = await pool.request().query(createAdminTableQuery)
    const checkTable = adminTable.recordset.length > 0
    if (!checkTable) {
      const pool = await dbConnection
      const createTrainingTableQuery = `CREATE TABLE TrainingDetails(trainingTitle VARCHAR(255) PRIMARY KEY,skillTitle VARCHAR(MAX),skillCategory VARCHAR(MAX),startDateTime  VARCHAR(MAX), endDateTime  VARCHAR(MAX) ,description VARCHAR(MAX), limit INT ) `
      await pool.request().query(createTrainingTableQuery)
      try {
        const pool = await dbConnection
        const GetTrainingDataQuery = `SELECT trainingTitle FROM  TrainingDetails WHERE trainingTitle = '${data.trainingTitle}'`


        const trainingData = await pool.request().query(GetTrainingDataQuery)
        if (trainingData.recordset) {
          res.status(200).json({ message: "already exists" })
        } else {
          const pool = await dbConnection
          const InsertDataTrainingTableQuery = `INSERT INTO TrainingDetails(trainingTitle,skillTitle ,skillCategory,startDateTime , endDateTime ,description, limit ) VALUES('${data.trainingTitle}','${data.skillTitle}','${data.skillCategory}','${data.startDateTime}','${data.endDateTime}','${data.description}','${data.limit}') `
          await pool.request().query(InsertDataTrainingTableQuery)
          res.status(201).json({ message: "success" })
        }
      } catch (error) {
        res.status(201).json({ message: error })
      }

      res.status(201).json({ message: "success" })

    } else {

      const pool = await dbConnection
      const GetTrainingDataQuery = `SELECT trainingTitle FROM  TrainingDetails WHERE trainingTitle = '${data.trainingTitle}'`
      console.log(GetTrainingDataQuery);
      const trainingData = await pool.request().query(GetTrainingDataQuery)
      console.log(trainingData.recordset.length > 0);

      if (trainingData.recordset.length > 0) {
        res.status(200).json({ message: "already exists" })
      } else {
        const pool = await dbConnection
        const InsertDataTrainingTableQuery = `INSERT INTO TrainingDetails(trainingTitle,skillTitle ,skillCategory,startDateTime , endDateTime ,description, limit ) VALUES('${data.trainingTitle}','${data.skillTitle}','${data.skillCategory}','${data.startDateTime}','${data.endDateTime}','${data.description}','${data.limit}') `
        await pool.request().query(InsertDataTrainingTableQuery)
        res.status(201).json({ message: "success" })
      }
    }

  } catch (error) {
    res.status(201).json({ message: error })

  }
})






// user Data Request



app.get('/get-training-data', async (req, res) => {
  const { token } = req.body
  if (token) {
    try {

      const pool = await dbConnection
      const getVerifiedUserDetails = `SELECT * FROM employee.UserInfo WHERE Token = '${token}'`
      const VerifiedUserData = await pool.request().query(getVerifiedUserDetails)
      if (VerifiedUserData.recordset.length > 0) {
        const pool = await dbConnection
        const getTrainingDetails = `SELECT * FROM TrainingDetails`
        const trainingData = await pool.request().query(getTrainingDetails)
        if (trainingData.recordset.length > 0) {
          const reqTrainingData = trainingData.recordset
          res.status(200).json({ message: "successfully", trainingData: reqTrainingData })
        } else {
          res.status(200).json({ message: "Data Not Found" })
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
})


// register for training




app.get('/training-request/:training', async (req, res) => {
  const { token } = req.body
  const trainingName = req.params.training
  if (token) {
    const pool = await dbConnection
    const getVerifiedUserDetails = `SELECT * FROM employee.UserInfo WHERE Token = '${token}'`
    const VerifiedUserData = await pool.request().query(getVerifiedUserDetails)
    const User = VerifiedUserData.recordset[0]
    console.log(User);

    if (trainingName) {
      const pool = await dbConnection
      const getSelectedTrainingDetails = `SELECT * FROM TrainingDetails WHERE trainingTitle = '${trainingName}'`
      const SelectedTrainingData = await pool.request().query(getSelectedTrainingDetails)
      const SelectedTraining = SelectedTrainingData.recordset[0]
      console.log(SelectedTraining);
      try {
        const pool = await dbConnection
        const createAdminTableQuery = `SELECT *
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = 'dbo' 
          AND TABLE_NAME = 'TrainingRegisteredUser'`
        const Tabletraining = await pool.request().query(createAdminTableQuery)
        const checkTable = Tabletraining.recordset.length > 0
        if (!checkTable) {
          const pool = await dbConnection
          const createRegisteredTrainingTableQuery = `CREATE TABLE TrainingRegisteredUser(Email VARCHAR(255),Firstname VARCHAR(MAX),Lastname VARCHAR(MAX),trainingTitle  VARCHAR(MAX), MobileNumber  VARCHAR(MAX) ,RegisteredDateTime VARCHAR(MAX)) `
          await pool.request().query(createRegisteredTrainingTableQuery)
          try {
            const pool = await dbConnection
            const GetRegisteredTrainingDataQuery = `SELECT trainingTitle FROM  TrainingRegisteredUser WHERE trainingTitle = '${SelectedTraining.trainingTitle}'`

            const RegisteredtrainingData = await pool.request().query(GetRegisteredTrainingDataQuery)
            if (RegisteredtrainingData.recordset.length > 0) {
              res.status(200).json({ message: "already exists" })
            } else {
              const pool = await dbConnection
              const dateTime = new Date()
              const InsertDataRegisteredTrainingTableQuery = `INSERT INTO TrainingRegisteredUser(Email,Firstname ,Lastname ,trainingTitle , MobileNumber ,RegisteredDateTime) VALUES('${User.Employee_Email}','${User.FirstName}','${User.LastName}','${SelectedTraining.trainingTitle}','${User.Number}','${dateTime}') `
              await pool.request().query(InsertDataRegisteredTrainingTableQuery)
              res.status(201).json({ message: "success" })
            }
          } catch (error) {
            res.status(201).json({ message: error })
          }
        } else {
          try {
            const pool = await dbConnection
            const GetRegisteredTrainingDataQuery = `SELECT trainingTitle FROM  TrainingRegisteredUser WHERE trainingTitle = '${SelectedTraining.trainingTitle}'`

            const RegisteredtrainingData = await pool.request().query(GetRegisteredTrainingDataQuery)
            if (RegisteredtrainingData.recordset.length > 0) {
              res.status(200).json({ message: "already exists" })
            } else {
              const pool = await dbConnection
              const dateTime = new Date()
              const InsertDataRegisteredTrainingTableQuery = `INSERT INTO TrainingRegisteredUser(Email,Firstname ,Lastname ,trainingTitle , MobileNumber ,RegisteredDateTime) VALUES('${User.Employee_Email}','${User.FirstName}','${User.LastName}','${SelectedTraining.trainingTitle}','${User.Number}','${dateTime}') `
              await pool.request().query(InsertDataRegisteredTrainingTableQuery)
              res.status(201).json({ message: "success" })
            }
          } catch (error) {
            res.status(201).json({ message: error })
          }
        }
        }catch (error) {
          console.log(error);
        }

        res.status(200).json({ message: "Training Success" })
      }else {
        res.status(200).json({ message: "Training Not Found" })

      }
    } else {
      res.status(200).json({ message: "Token Not Found" })

    }
  })









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
